import bcrypt from "bcrypt";
import prisma from "../config/db.js";

export async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error("[GetMe Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function updateMe(req, res) {
  try {
    const { name, email } = req.validatedBody || req.body;

    if (email) {
      const existing = await prisma.user.findFirst({
        where: { email, NOT: { id: req.user.userId } },
      });
      if (existing) {
        return res.status(409).json({ success: false, error: "Email already in use" });
      }
    }

    const updated = await prisma.user.update({
      where: { id: req.user.userId },
      data: { name, email },
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error("[UpdateMe Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function getUsers(req, res) {
  try {
    const { page, limit, role, search } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        select: { id: true, email: true, name: true, role: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: users,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error("[GetUsers Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.validatedBody || req.body;

    if (id === req.user.userId) {
      return res.status(403).json({ success: false, error: "Cannot change your own role" });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    console.error("[UpdateUserRole Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    if (id === req.user.userId) {
      return res.status(403).json({ success: false, error: "Cannot delete your own account" });
    }

    await prisma.user.delete({ where: { id } });

    return res.status(200).json({ success: true, data: { message: "User deleted" } });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    console.error("[DeleteUser Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}
