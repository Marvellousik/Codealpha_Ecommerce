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

describe("Order Controller", () => {
  before(async () => {
    ({ server, baseUrl } = await startTestServer());
    await clearDatabase();

    ({ user: customer, token: customerToken } = await createTestUser("CUSTOMER"));
    ({ user: seller, token: sellerToken } = await createTestUser("SELLER"));
    ({ user: admin, token: adminToken } = await createTestUser("ADMIN"));
    category = await createTestCategory();
    product = await createTestProduct(seller.id, category.id, { stock: 10, price: 99.99 });

    // Add to cart
    await fetch(`${baseUrl}/api/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ productId: product.id, quantity: 2 }),
    });
  });

  after(async () => {
    await clearDatabase();
    await stopTestServer(server);
  });

  it("should create order from cart", async () => {
    const res = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: { Authorization: `Bearer ${customerToken}` },
    });

    const body = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.strictEqual(body.data.length, 1);
    assert.strictEqual(body.data[0].status, "PENDING");
    assert.strictEqual(Number(body.data[0].totalAmount), 199.98);
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
    assert.ok(body.data.length > 0);
  });

  it("should allow seller to update order status", async () => {
    // Get order id
    const ordersRes = await fetch(`${baseUrl}/api/orders`, {
      headers: { Authorization: `Bearer ${sellerToken}` },
    });
    const ordersBody = await ordersRes.json();
    const orderId = ordersBody.data[0].id;

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
    const ordersRes = await fetch(`${baseUrl}/api/orders`, {
      headers: { Authorization: `Bearer ${sellerToken}` },
    });
    const ordersBody = await ordersRes.json();
    const orderId = ordersBody.data[0].id;

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
