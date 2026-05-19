import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import {
  clearDatabase,
  startTestServer,
  stopTestServer,
} from "../utils/test-helpers.js";

let server, baseUrl;

describe("Auth Controller", () => {
  before(async () => {
    ({ server, baseUrl } = await startTestServer());
    await clearDatabase();
  });

  after(async () => {
    await clearDatabase();
    await stopTestServer(server);
  });

  it("should register a new customer", async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "customer@test.com",
        password: "Test@1234",
        name: "Test Customer",
        role: "CUSTOMER",
      }),
    });

    const body = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(body.success, true);
    assert.ok(body.data.token);
    assert.strictEqual(body.data.user.role, "CUSTOMER");
    assert.strictEqual(body.data.user.email, "customer@test.com");
  });

  it("should register a new seller", async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "seller@test.com",
        password: "Test@1234",
        name: "Test Seller",
        role: "SELLER",
      }),
    });

    const body = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.user.role, "SELLER");
  });

  it("should reject duplicate email", async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "customer@test.com",
        password: "Test@1234",
        name: "Another",
        role: "CUSTOMER",
      }),
    });

    const body = await res.json();
    assert.strictEqual(res.status, 409);
    assert.strictEqual(body.success, false);
  });

  it("should reject ADMIN registration", async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin-attempt@test.com",
        password: "Test@1234",
        name: "Bad Admin",
        role: "ADMIN",
      }),
    });

    const body = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(body.success, false);
  });

  it("should reject weak password", async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "weak@test.com",
        password: "weak",
        name: "Weak",
        role: "CUSTOMER",
      }),
    });

    const body = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(body.success, false);
    assert.ok(Array.isArray(body.details));
  });

  it("should login with valid credentials", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "customer@test.com",
        password: "Test@1234",
      }),
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.ok(body.data.token);
  });

  it("should reject invalid credentials with generic message", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "customer@test.com",
        password: "WrongPassword123!",
      }),
    });

    const body = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error, "Invalid credentials");
  });

  it("should reject non-existent email with generic message", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "nonexistent@test.com",
        password: "Test@1234",
      }),
    });

    const body = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(body.error, "Invalid credentials");
  });
});
