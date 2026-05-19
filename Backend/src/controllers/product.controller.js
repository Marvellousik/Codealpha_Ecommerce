import prisma from "../config/db.js";

export async function createProduct(req, res) {
  try {
    const { name, description, price, stock, imageUrl, categoryId } = req.validatedBody || req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock: stock ?? 0,
        imageUrl: imageUrl || null,
        categoryId,
        sellerId: req.user.userId,
      },
    });

    return res.status(201).json({
      success: true,
      data: product,
    });
  } catch (err) {
    console.error("[Product Create Error]:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

export async function getProducts(req, res) {
  try {
    const { categoryId, search, page, limit } = req.query;
    const where = {};

    if (categoryId) where.categoryId = categoryId;
    if (search) where.name = { contains: search, mode: "insensitive" };

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          seller: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: products,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("[Product List Error]:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

export async function getProductById(req, res) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        reviews: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    console.error("[Product Get Error]:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, description, price, stock, imageUrl, categoryId } = req.validatedBody || req.body;

    const existing = await prisma.product.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    if (existing.sellerId !== req.user.userId && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        error: "Forbidden: not your product",
      });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: price !== undefined ? Number(price) : undefined,
        stock: stock !== undefined ? Number(stock) : undefined,
        imageUrl: imageUrl !== undefined ? (imageUrl || null) : undefined,
        categoryId,
      },
    });

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    console.error("[Product Update Error]:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.product.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    if (existing.sellerId !== req.user.userId && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        error: "Forbidden: not your product",
      });
    }

    await prisma.product.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      data: { message: "Product deleted" },
    });
  } catch (err) {
    console.error("[Product Delete Error]:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

export async function getMyProducts(req, res) {
  try {
    const products = await prisma.product.findMany({
      where: { sellerId: req.user.userId },
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { orderItems: true } },
      },
    });

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (err) {
    console.error("[My Products Error]:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
