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
let seller, sellerToken;
let admin, adminToken;
let customer, customerToken;
let category;
let product;

describe("Product Controller", () => {
  before(async () => {
    ({ server, baseUrl } = await startTestServer());
    await clearDatabase();

    ({ user: seller, token: sellerToken } = await createTestUser("SELLER"));
    ({ user: admin, token: adminToken } = await createTestUser("ADMIN"));
    ({ user: customer, token: customerToken } = await createTestUser("CUSTOMER"));
    category = await createTestCategory();
    product = await createTestProduct(seller.id, category.id, { name: "Test Product" });
  });

  after(async () => {
    await clearDatabase();
    await stopTestServer(server);
  });

  it("should get products with pagination", async () => {
    const res = await fetch(`${baseUrl}/api/products`);
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.meta);
    assert.strictEqual(typeof body.meta.total, "number");
  });

  it("should get product by id", async () => {
    const res = await fetch(`${baseUrl}/api/products/${product.id}`);
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.data.id, product.id);
  });

  it("should return 404 for non-existent product", async () => {
    const res = await fetch(`${baseUrl}/api/products/nonexistent-id`);
    const body = await res.json();

    assert.strictEqual(res.status, 404);
    assert.strictEqual(body.success, false);
  });

  it("should allow seller to create product", async () => {
    const res = await fetch(`${baseUrl}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sellerToken}`,
      },
      body: JSON.stringify({
        name: "Seller Product",
        description: "Created by seller",
        price: 199.99,
        stock: 5,
        categoryId: category.id,
      }),
    });

    const body = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.name, "Seller Product");
  });

  it("should allow admin to create product", async () => {
    const res = await fetch(`${baseUrl}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: "Admin Product",
        description: "Created by admin",
        price: 299.99,
        stock: 10,
        categoryId: category.id,
      }),
    });

    const body = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(body.data.name, "Admin Product");
  });

  it("should reject customer creating product", async () => {
    const res = await fetch(`${baseUrl}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        name: "Customer Product",
        price: 99.99,
        categoryId: category.id,
      }),
    });

    assert.strictEqual(res.status, 403);
  });

  it("should allow seller to update own product", async () => {
    const res = await fetch(`${baseUrl}/api/products/${product.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sellerToken}`,
      },
      body: JSON.stringify({ name: "Updated Product Name" }),
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.data.name, "Updated Product Name");
  });

  it("should allow admin to update any product", async () => {
    const res = await fetch(`${baseUrl}/api/products/${product.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ price: 149.99 }),
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(Number(body.data.price), 149.99);
  });

  it("should reject customer updating product", async () => {
    const res = await fetch(`${baseUrl}/api/products/${product.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ name: "Hacked" }),
    });

    assert.strictEqual(res.status, 403);
  });

  it("should return seller's own products", async () => {
    const res = await fetch(`${baseUrl}/api/products/seller/my-products`, {
      headers: { Authorization: `Bearer ${sellerToken}` },
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);
  });
});
