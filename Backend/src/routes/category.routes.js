import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { categorySchema, categoryUpdateSchema } from "../utils/schemas.js";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

const router = Router();

router.get("/", getCategories);
router.get("/:id", getCategoryById);

router.post("/", authMiddleware, authorizeRoles("ADMIN"), validate(categorySchema), createCategory);
router.patch("/:id", authMiddleware, authorizeRoles("ADMIN"), validate(categoryUpdateSchema), updateCategory);
router.delete("/:id", authMiddleware, authorizeRoles("ADMIN"), deleteCategory);

export default router;
