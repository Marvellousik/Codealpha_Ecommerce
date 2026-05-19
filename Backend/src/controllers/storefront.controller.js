import prisma from "../config/db.js";

export async function getConfigs(req, res) {
  try {
    const configs = await prisma.storefrontConfig.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, data: configs });
  } catch (err) {
    console.error("[GetConfigs Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function getConfigByKey(req, res) {
  try {
    const { key } = req.params;
    const config = await prisma.storefrontConfig.findUnique({
      where: { key },
    });

    if (!config || !config.isActive) {
      return res.status(404).json({ success: false, error: "Config not found" });
    }

    return res.status(200).json({ success: true, data: config });
  } catch (err) {
    console.error("[GetConfigByKey Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function getFeatured(req, res) {
  try {
    const featuredConfig = await prisma.storefrontConfig.findUnique({
      where: { key: "FEATURED_PRODUCT_IDS" },
    });

    const newDropsConfig = await prisma.storefrontConfig.findUnique({
      where: { key: "NEW_DROP_IDS" },
    });

    const featuredIds = Array.isArray(featuredConfig?.value) ? featuredConfig.value : [];
    const newDropIds = Array.isArray(newDropsConfig?.value) ? newDropsConfig.value : [];

    const featured = featuredIds.length
      ? await prisma.product.findMany({
          where: { id: { in: featuredIds } },
          include: {
            seller: { select: { id: true, name: true } },
            category: { select: { id: true, name: true } },
          },
        })
      : [];

    const newDrops = newDropIds.length
      ? await prisma.product.findMany({
          where: { id: { in: newDropIds } },
          include: {
            seller: { select: { id: true, name: true } },
            category: { select: { id: true, name: true } },
          },
        })
      : [];

    return res.status(200).json({
      success: true,
      data: { featured, newDrops },
    });
  } catch (err) {
    console.error("[GetFeatured Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function createConfig(req, res) {
  try {
    const { key, value, description, isActive } = req.validatedBody || req.body;

    const config = await prisma.storefrontConfig.create({
      data: { key, value, description, isActive },
    });

    return res.status(201).json({ success: true, data: config });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ success: false, error: "Config key already exists" });
    }
    console.error("[CreateConfig Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function updateConfig(req, res) {
  try {
    const { id } = req.params;
    const { key, value, description, isActive } = req.validatedBody || req.body;

    const updated = await prisma.storefrontConfig.update({
      where: { id },
      data: { key, value, description, isActive },
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, error: "Config not found" });
    }
    if (err.code === "P2002") {
      return res.status(409).json({ success: false, error: "Config key already exists" });
    }
    console.error("[UpdateConfig Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function deleteConfig(req, res) {
  try {
    const { id } = req.params;

    await prisma.storefrontConfig.delete({ where: { id } });

    return res.status(200).json({ success: true, data: { message: "Config deleted" } });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, error: "Config not found" });
    }
    console.error("[DeleteConfig Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}
