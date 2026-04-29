import prisma from "./config/db.js";

async function test() {
  try {
    await prisma.$connect();
    console.log("DB CONNECTION SUCCESSFUL");
  } catch (err) {
    console.error("DB CONNECTION FAILED:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();