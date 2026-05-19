import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { storefrontConfigSchema, storefrontConfigUpdateSchema } from "../utils/schemas.js";
import {
  getConfigs,
  getConfigByKey,
  getFeatured,
  createConfig,
  updateConfig,
  deleteConfig,
} from "../controllers/storefront.controller.js";

const router = Router();

// Public routes
router.get("/featured", getFeatured);
router.get("/", getConfigs);
router.get("/:key", getConfigByKey);

// Admin-only routes
router.post("/", authMiddleware, authorizeRoles("ADMIN"), validate(storefrontConfigSchema), createConfig);
router.patch("/:id", authMiddleware, authorizeRoles("ADMIN"), validate(storefrontConfigUpdateSchema), updateConfig);
router.delete("/:id", authMiddleware, authorizeRoles("ADMIN"), deleteConfig);

export default router;
