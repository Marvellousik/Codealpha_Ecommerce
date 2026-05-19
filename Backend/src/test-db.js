import "dotenv/config";
import prisma from "./config/db.js";

async function test() {
  try {
    // 1. Create User
    const user = await prisma.user.create({
      data: {
        email: "buyer@test.com",
        password: "hashedpassword",
      },
    });

    console.log("USER:", user.id);

    // 2. Create Category
    const category = await prisma.category.create({
      data: {
        name: "Anime",
      },
    });

    console.log("CATEGORY:", category.id);

    // 3. Create Product
    const product = await prisma.product.create({
      data: {
        name: "Anime Hoodie",
        price: 15000,
        stock: 10,
        categoryId: category.id,
      },
    });

    console.log("PRODUCT:", product.id);

    // 4. Create Order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: 15000,
      },
    });

    console.log("ORDER:", order.id);

    // 5. Create OrderItem
    const item = await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: product.id,
        quantity: 1,
        price: 15000,
      },
    });

    console.log("ORDER ITEM:", item.id);

  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();