import prisma from "../config/db.js";

export async function getCategories(req, res) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    });

    return res.status(200).json({ success: true, data: categories });
  } catch (err) {
    console.error("[GetCategories Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function getCategoryById(req, res) {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }

    return res.status(200).json({ success: true, data: category });
  } catch (err) {
    console.error("[GetCategoryById Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function createCategory(req, res) {
  try {
    const { name, description } = req.validatedBody || req.body;

    const category = await prisma.category.create({
      data: { name, description },
    });

    return res.status(201).json({ success: true, data: category });
  } catch (err) {
    console.error("[CreateCategory Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.validatedBody || req.body;

    const updated = await prisma.category.update({
      where: { id },
      data: { name, description },
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, error: "Category not found" });
    }
    console.error("[UpdateCategory Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return res.status(409).json({
        success: false,
        error: "Cannot delete category with existing products",
      });
    }

    await prisma.category.delete({ where: { id } });

    return res.status(200).json({ success: true, data: { message: "Category deleted" } });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, error: "Category not found" });
    }
    console.error("[DeleteCategory Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}
