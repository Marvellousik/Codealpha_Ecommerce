import prisma from "../config/db.js";

export async function getCart(req, res) {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            stock: true,
            category: { select: { name: true } },
            seller: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const total = items.reduce((sum, item) => sum + item.quantity * Number(item.product.price), 0);

    return res.status(200).json({
      success: true,
      data: { items, total: Number(total.toFixed(2)) },
    });
  } catch (err) {
    console.error("[GetCart Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function addToCart(req, res) {
  try {
    const { productId, quantity } = req.validatedBody || req.body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, stock: true, price: true },
    });

    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, error: "Not enough stock available" });
    }

    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId: req.user.userId,
          productId,
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        userId: req.user.userId,
        productId,
        quantity,
      },
      include: {
        product: {
          select: { id: true, name: true, price: true, imageUrl: true },
        },
      },
    });

    return res.status(200).json({ success: true, data: cartItem });
  } catch (err) {
    console.error("[AddToCart Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function updateCartItem(req, res) {
  try {
    const { id } = req.params;
    const { quantity } = req.validatedBody || req.body;

    const existing = await prisma.cartItem.findFirst({
      where: { id, userId: req.user.userId },
      include: { product: { select: { stock: true } } },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: "Cart item not found" });
    }

    if (existing.product.stock < quantity) {
      return res.status(400).json({ success: false, error: "Not enough stock available" });
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: {
        product: {
          select: { id: true, name: true, price: true, imageUrl: true },
        },
      },
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error("[UpdateCartItem Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function removeCartItem(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.cartItem.findFirst({
      where: { id, userId: req.user.userId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: "Cart item not found" });
    }

    await prisma.cartItem.delete({ where: { id } });

    return res.status(200).json({ success: true, data: { message: "Item removed from cart" } });
  } catch (err) {
    console.error("[RemoveCartItem Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function clearCart(req, res) {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.userId },
    });

    return res.status(200).json({ success: true, data: { message: "Cart cleared" } });
  } catch (err) {
    console.error("[ClearCart Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}
