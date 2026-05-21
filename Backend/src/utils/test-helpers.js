import prisma from "../config/db.js";
import { signToken } from "./jwt.js";
import bcrypt from "bcrypt";
import http from "http";
import app from "../app.js";

export async function clearDatabase() {
  // Sequential deletes to avoid transaction timeouts on serverless Postgres
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.storefrontConfig.deleteMany();
}

export async function createTestUser(role = "CUSTOMER", overrides = {}) {
  const email = overrides.email || `test-${role.toLowerCase()}-${Date.now()}@test.com`;
  const password = await bcrypt.hash("Test@1234", 12);

  const user = await prisma.user.create({
    data: {
      email,
      password,
      name: overrides.name || `Test ${role}`,
      role,
      ...overrides,
    },
  });

  const token = signToken({ userId: user.id, role: user.role });
  const { password: _, ...safeUser } = user;

  return { user: safeUser, token, rawUser: user };
}

export async function createTestCategory(overrides = {}) {
  return prisma.category.create({
    data: {
      name: overrides.name || `Test Category ${Date.now()}`,
      description: overrides.description || "A test category",
    },
  });
}

export async function createTestProduct(sellerId, categoryId, overrides = {}) {
  return prisma.product.create({
    data: {
      name: overrides.name || `Test Product ${Date.now()}`,
      description: overrides.description || "A test product",
      price: overrides.price || 99.99,
      stock: overrides.stock ?? 10,
      imageUrl: overrides.imageUrl || null,
      categoryId,
      sellerId,
    },
  });
}

export async function createTestCartItem(userId, productId, quantity = 1) {
  return prisma.cartItem.create({
    data: { userId, productId, quantity },
  });
}

export async function startTestServer() {
  return new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      const baseUrl = `http://localhost:${port}`;
      resolve({ server, baseUrl });
    });
  });
}

export async function stopTestServer(server) {
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
}
