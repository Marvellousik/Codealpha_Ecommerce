import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { productSchema, productUpdateSchema } from "../utils/schemas.js";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts,
} from "../controllers/product.controller.js";

const router = Router();

router.get("/seller/my-products", authMiddleware, authorizeRoles("SELLER", "ADMIN"), getMyProducts);

router.get("/", getProducts);
router.get("/:id", getProductById);

router.post("/", authMiddleware, authorizeRoles("SELLER", "ADMIN"), validate(productSchema), createProduct);
router.patch("/:id", authMiddleware, validate(productUpdateSchema), updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);

export default router;
