import prisma from "../config/db.js";

export async function createReview(req, res) {
  try {
    const { productId, rating, comment } = req.validatedBody || req.body;

    // Verify user has purchased the product
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: req.user.userId,
          status: { not: "CANCELLED" },
        },
      },
    });

    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        error: "You can only review products you have purchased",
      });
    }

    // Check for existing review
    const existingReview = await prisma.review.findFirst({
      where: { userId: req.user.userId, productId },
    });

    let review;
    if (existingReview) {
      // Update existing review
      review = await prisma.review.update({
        where: { id: existingReview.id },
        data: { rating, comment },
        include: { user: { select: { id: true, name: true } } },
      });
    } else {
      review = await prisma.review.create({
        data: {
          userId: req.user.userId,
          productId,
          rating,
          comment,
        },
        include: { user: { select: { id: true, name: true } } },
      });
    }

    return res.status(201).json({ success: true, data: review });
  } catch (err) {
    console.error("[CreateReview Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function getReviews(req, res) {
  try {
    const { productId, page, limit } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (productId) where.productId = productId;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          user: { select: { id: true, name: true } },
          product: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.review.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: reviews,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error("[GetReviews Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function getMyReviews(req, res) {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId: req.user.userId },
      include: {
        product: { select: { id: true, name: true, imageUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    console.error("[GetMyReviews Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function deleteReview(req, res) {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!review) {
      return res.status(404).json({ success: false, error: "Review not found" });
    }

    if (review.userId !== req.user.userId && req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    await prisma.review.delete({ where: { id } });

    return res.status(200).json({ success: true, data: { message: "Review deleted" } });
  } catch (err) {
    console.error("[DeleteReview Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}
