import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import {
  clearDatabase,
  startTestServer,
  stopTestServer,
  createTestUser,
  createTestCategory,
  createTestProduct,
} from "../utils/test-helpers.js";

let server, baseUrl;
let customer, customerToken;
let seller, sellerToken;
let admin, adminToken;
let category;
let product;
let orderId;

describe("Order Controller", () => {
  before(async () => {
    ({ server, baseUrl } = await startTestServer());
    await clearDatabase();

    ({ user: customer, token: customerToken } = await createTestUser("CUSTOMER"));
    ({ user: seller, token: sellerToken } = await createTestUser("SELLER"));
    ({ user: admin, token: adminToken } = await createTestUser("ADMIN"));
    category = await createTestCategory();
    product = await createTestProduct(seller.id, category.id, { stock: 10, price: 99.99 });

    // Add to cart and create order
    await fetch(`${baseUrl}/api/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ productId: product.id, quantity: 2 }),
    });

    const orderRes = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const orderBody = await orderRes.json();
    orderId = orderBody.data[0].id;
  });

  after(async () => {
    await clearDatabase();
    await stopTestServer(server);
  });

  it("should create order from cart", async () => {
    // Create a fresh order for this test
    await fetch(`${baseUrl}/api/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ productId: product.id, quantity: 1 }),
    });

    const res = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: { Authorization: `Bearer ${customerToken}` },
    });

    const body = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 1);
    assert.strictEqual(body.data[0].status, "PENDING");
  });

  it("should reject empty cart order", async () => {
    const res = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: { Authorization: `Bearer ${customerToken}` },
    });

    const body = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(body.success, false);
  });

  it("should allow customer to view their orders", async () => {
    const res = await fetch(`${baseUrl}/api/orders`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(body.data.length > 0);
  });

  it("should allow seller to view their sold orders", async () => {
    const res = await fetch(`${baseUrl}/api/orders`, {
      headers: { Authorization: `Bearer ${sellerToken}` },
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(body.data.length > 0, `Expected seller to have orders but got: ${JSON.stringify(body)}`);
  });

  it("should allow seller to update order status", async () => {
    const res = await fetch(`${baseUrl}/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sellerToken}`,
      },
      body: JSON.stringify({ status: "PROCESSING" }),
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.data.status, "PROCESSING");
  });

  it("should reject invalid status transition", async () => {
    // PROCESSING -> DELIVERED is invalid (must go through SHIPPED)
    const res = await fetch(`${baseUrl}/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sellerToken}`,
      },
      body: JSON.stringify({ status: "DELIVERED" }),
    });

    const body = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(body.success, false);
  });

  it("should allow admin to view all orders", async () => {
    const res = await fetch(`${baseUrl}/api/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(body.data.length > 0);
  });
});
