import prisma from "../config/db.js";

const VALID_TRANSITIONS = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export async function createOrder(req, res) {
  try {
    // Fetch cart with product details
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.userId },
      include: {
        product: {
          select: { id: true, price: true, stock: true, sellerId: true, name: true },
        },
      },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, error: "Cart is empty" });
    }

    // Validate stock for all items
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Not enough stock for ${item.product.name}. Available: ${item.product.stock}, Requested: ${item.quantity}`,
        });
      }
    }

    // Group cart items by seller
    const bySeller = {};
    for (const item of cartItems) {
      const sid = item.product.sellerId;
      if (!bySeller[sid]) bySeller[sid] = [];
      bySeller[sid].push(item);
    }

    const createdOrders = [];

    // Create one order per seller in a transaction
    await prisma.$transaction(async (tx) => {
      for (const [sellerId, items] of Object.entries(bySeller)) {
        const totalAmount = items.reduce(
          (sum, item) => sum + item.quantity * Number(item.product.price),
          0
        );

        const order = await tx.order.create({
          data: {
            userId: req.user.userId,
            sellerId,
            totalAmount,
            status: "PENDING",
            items: {
              create: items.map((item) => ({
                productId: item.product.id,
                quantity: item.quantity,
                price: item.product.price,
              })),
            },
          },
          include: {
            items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } },
            seller: { select: { id: true, name: true } },
          },
        });

        // Deduct stock
        for (const item of items) {
          await tx.product.update({
            where: { id: item.product.id },
            data: { stock: { decrement: item.quantity } },
          });
        }

        createdOrders.push(order);
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId: req.user.userId },
      });
    });

    return res.status(201).json({
      success: true,
      data: createdOrders,
    });
  } catch (err) {
    console.error("[CreateOrder Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function getOrders(req, res) {
  try {
    const { page, limit, status, userId, sellerId } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status) where.status = status;

    if (req.user.role === "CUSTOMER") {
      where.userId = req.user.userId;
    } else if (req.user.role === "SELLER") {
      where.sellerId = req.user.userId;
    } else if (req.user.role === "ADMIN") {
      if (userId) where.userId = userId;
      if (sellerId) where.sellerId = sellerId;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, imageUrl: true } },
            },
          },
          user: { select: { id: true, name: true, email: true } },
          seller: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: orders,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error("[GetOrders Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function getOrderById(req, res) {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true, price: true } },
          },
        },
        user: { select: { id: true, name: true, email: true } },
        seller: { select: { id: true, name: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    // Authorization check
    if (
      req.user.role !== "ADMIN" &&
      order.userId !== req.user.userId &&
      order.sellerId !== req.user.userId
    ) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error("[GetOrderById Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status: newStatus } = req.validatedBody || req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      select: { id: true, status: true, sellerId: true, userId: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    // Authorization: SELLER can only update their own orders; ADMIN can update any
    if (req.user.role === "SELLER" && order.sellerId !== req.user.userId) {
      return res.status(403).json({ success: false, error: "Forbidden: not your order" });
    }

    // Validate status transition
    const allowed = VALID_TRANSITIONS[order.status] || [];
    if (!allowed.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        error: `Cannot transition from ${order.status} to ${newStatus}. Allowed: ${allowed.join(", ") || "none"}`,
      });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: newStatus },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true } },
          },
        },
      },
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error("[UpdateOrderStatus Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}
