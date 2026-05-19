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
let admin, adminToken;
let seller;
let category;
let product;

describe("Storefront Controller", () => {
  before(async () => {
    ({ server, baseUrl } = await startTestServer());
    await clearDatabase();

    ({ user: admin, token: adminToken } = await createTestUser("ADMIN"));
    ({ user: seller } = await createTestUser("SELLER"));
    category = await createTestCategory();
    product = await createTestProduct(seller.id, category.id);

    // Seed config
    await fetch(`${baseUrl}/api/config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        key: "FEATURED_PRODUCT_IDS",
        value: [product.id],
        description: "Test featured",
      }),
    });

    await fetch(`${baseUrl}/api/config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        key: "NEW_DROP_IDS",
        value: [product.id],
        description: "Test new drops",
      }),
    });
  });

  after(async () => {
    await clearDatabase();
    await stopTestServer(server);
  });

  it("should get featured products publicly", async () => {
    const res = await fetch(`${baseUrl}/api/config/featured`);
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data.featured));
    assert.ok(Array.isArray(body.data.newDrops));
    assert.strictEqual(body.data.featured[0].id, product.id);
  });

  it("should get all configs publicly", async () => {
    const res = await fetch(`${baseUrl}/api/config`);
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.ok(body.data.length >= 2);
  });

  it("should reject non-admin creating config", async () => {
    const { token: userToken } = await createTestUser("CUSTOMER");
    const res = await fetch(`${baseUrl}/api/config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        key: "HACKED",
        value: "bad",
      }),
    });

    assert.strictEqual(res.status, 403);
  });

  it("should allow admin to update config", async () => {
    // Get config id
    const configsRes = await fetch(`${baseUrl}/api/config`);
    const configsBody = await configsRes.json();
    const configId = configsBody.data.find((c) => c.key === "FEATURED_PRODUCT_IDS").id;

    const res = await fetch(`${baseUrl}/api/config/${configId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ value: [] }),
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(body.data.value, []);
  });
});
