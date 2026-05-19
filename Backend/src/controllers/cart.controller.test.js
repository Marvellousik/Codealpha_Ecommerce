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
let seller;
let category;
let product;

describe("Cart Controller", () => {
  before(async () => {
    ({ server, baseUrl } = await startTestServer());
    await clearDatabase();

    ({ user: customer, token: customerToken } = await createTestUser("CUSTOMER"));
    ({ user: seller } = await createTestUser("SELLER"));
    category = await createTestCategory();
    product = await createTestProduct(seller.id, category.id, { stock: 10 });
  });

  after(async () => {
    await clearDatabase();
    await stopTestServer(server);
  });

  it("should add item to cart", async () => {
    const res = await fetch(`${baseUrl}/api/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ productId: product.id, quantity: 2 }),
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.quantity, 2);
  });

  it("should get cart with items", async () => {
    const res = await fetch(`${baseUrl}/api/cart`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data.items));
    assert.strictEqual(body.data.items.length, 1);
    assert.ok(typeof body.data.total === "number");
  });

  it("should update cart item quantity", async () => {
    // First get the cart item id
    const cartRes = await fetch(`${baseUrl}/api/cart`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const cartBody = await cartRes.json();
    const itemId = cartBody.data.items[0].id;

    const res = await fetch(`${baseUrl}/api/cart/${itemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ quantity: 3 }),
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.data.quantity, 3);
  });

  it("should reject quantity exceeding stock", async () => {
    const cartRes = await fetch(`${baseUrl}/api/cart`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const cartBody = await cartRes.json();
    const itemId = cartBody.data.items[0].id;

    const res = await fetch(`${baseUrl}/api/cart/${itemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ quantity: 999 }),
    });

    const body = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(body.success, false);
  });

  it("should remove item from cart", async () => {
    const cartRes = await fetch(`${baseUrl}/api/cart`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const cartBody = await cartRes.json();
    const itemId = cartBody.data.items[0].id;

    const res = await fetch(`${baseUrl}/api/cart/${itemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${customerToken}` },
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
  });

  it("should clear cart", async () => {
    // Add item first
    await fetch(`${baseUrl}/api/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ productId: product.id, quantity: 1 }),
    });

    const res = await fetch(`${baseUrl}/api/cart`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${customerToken}` },
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);

    // Verify empty
    const cartRes = await fetch(`${baseUrl}/api/cart`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const cartBody = await cartRes.json();
    assert.strictEqual(cartBody.data.items.length, 0);
  });
});
