import bcrypt from "bcrypt";
import prisma from "../src/config/db.js";

async function main() {
  console.log("🌱 Seeding AppleVault database...");

  // --- Categories ---
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "iPhones" },
      update: {},
      create: { name: "iPhones", description: "Latest iPhone models and accessories" },
    }),
    prisma.category.upsert({
      where: { name: "iPads" },
      update: {},
      create: { name: "iPads", description: "iPad Pro, Air, and Mini lineup" },
    }),
    prisma.category.upsert({
      where: { name: "AirPods" },
      update: {},
      create: { name: "AirPods", description: "Wireless earbuds and headphones" },
    }),
    prisma.category.upsert({
      where: { name: "Accessories" },
      update: {},
      create: { name: "Accessories", description: "Chargers, cases, and wearables" },
    }),
  ]);

  const [iphones, ipads, airpods, accessories] = categories;
  console.log(`✅ Created ${categories.length} categories`);

  // --- Users ---
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@1234", 12);
  const sellerPassword = await bcrypt.hash("Seller@1234", 12);
  const customerPassword = await bcrypt.hash("Customer@1234", 12);

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@applevault.com" },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || "admin@applevault.com",
      password: adminPassword,
      name: "Central Admin",
      role: "ADMIN",
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: "seller@applevault.com" },
    update: {},
    create: {
      email: "seller@applevault.com",
      password: sellerPassword,
      name: "AppleVault Seller",
      role: "SELLER",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@applevault.com" },
    update: {},
    create: {
      email: "customer@applevault.com",
      password: customerPassword,
      name: "John Doe",
      role: "CUSTOMER",
    },
  });

  console.log(`✅ Created users: admin (${admin.email}), seller, customer`);

  // --- Products ---
  const productsData = [
    {
      name: "iPhone 15 Pro Max",
      description: "Forged in titanium. The most powerful iPhone ever with A17 Pro chip.",
      price: 1199.00,
      stock: 25,
      imageUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max",
      categoryId: iphones.id,
      sellerId: seller.id,
    },
    {
      name: "iPhone 15 Pro",
      description: "Titanium design. A17 Pro chip. Advanced camera system.",
      price: 999.00,
      stock: 30,
      imageUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro",
      categoryId: iphones.id,
      sellerId: seller.id,
    },
    {
      name: "iPad Pro 12.9\"",
      description: "M2 chip. 12.9\" Liquid Retina XDR display. Pro cameras.",
      price: 1099.00,
      stock: 15,
      imageUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-12",
      categoryId: ipads.id,
      sellerId: seller.id,
    },
    {
      name: "iPad Air",
      description: "M1 chip. 10.9\" Liquid Retina display. All-screen design.",
      price: 599.00,
      stock: 20,
      imageUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-air",
      categoryId: ipads.id,
      sellerId: seller.id,
    },
    {
      name: "AirPods Pro 2",
      description: "Active Noise Cancellation. Adaptive Transparency. H2 chip.",
      price: 249.00,
      stock: 50,
      imageUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-pro-2",
      categoryId: airpods.id,
      sellerId: seller.id,
    },
    {
      name: "AirPods Max",
      description: "High-fidelity audio. Active Noise Cancellation. Computational audio.",
      price: 549.00,
      stock: 12,
      imageUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max",
      categoryId: airpods.id,
      sellerId: seller.id,
    },
    {
      name: "MagSafe Charger",
      description: "Fast wireless charging up to 15W. Magnetic alignment.",
      price: 39.00,
      stock: 100,
      imageUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/magsafe-charger",
      categoryId: accessories.id,
      sellerId: seller.id,
    },
    {
      name: "Apple Watch Ultra 2",
      description: "Rugged titanium case. 3000-nit display. Precision GPS.",
      price: 799.00,
      stock: 10,
      imageUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/apple-watch-ultra-2",
      categoryId: accessories.id,
      sellerId: seller.id,
    },
  ];

  const products = [];
  for (const data of productsData) {
    const product = await prisma.product.upsert({
      where: {
        id: `seed-${data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      },
      update: {},
      create: {
        id: `seed-${data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        ...data,
      },
    });
    products.push(product);
  }

  console.log(`✅ Created ${products.length} products`);

  // --- Storefront Config ---
  const featuredIds = products.slice(0, 4).map((p) => p.id);
  const newDropIds = products.slice(4, 8).map((p) => p.id);

  await prisma.storefrontConfig.upsert({
    where: { key: "FEATURED_PRODUCT_IDS" },
    update: { value: featuredIds },
    create: {
      key: "FEATURED_PRODUCT_IDS",
      value: featuredIds,
      description: "IDs of products shown in the Featured Products section on the homepage",
    },
  });

  await prisma.storefrontConfig.upsert({
    where: { key: "NEW_DROP_IDS" },
    update: { value: newDropIds },
    create: {
      key: "NEW_DROP_IDS",
      value: newDropIds,
      description: "IDs of products shown in the New Drops carousel on the homepage",
    },
  });

  console.log(`✅ Created storefront configs`);

  // --- Cart for customer ---
  await prisma.cartItem.deleteMany({ where: { userId: customer.id } });
  await prisma.cartItem.create({
    data: {
      userId: customer.id,
      productId: products[0].id,
      quantity: 1,
    },
  });

  console.log(`✅ Seeded customer cart`);
  console.log("🎉 Seed complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
