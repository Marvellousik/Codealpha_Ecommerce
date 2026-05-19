import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { cartItemSchema, cartItemUpdateSchema } from "../utils/schemas.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";

const router = Router();

router.get("/", authMiddleware, getCart);
router.post("/", authMiddleware, validate(cartItemSchema), addToCart);
router.patch("/:id", authMiddleware, validate(cartItemUpdateSchema), updateCartItem);
router.delete("/:id", authMiddleware, removeCartItem);
router.delete("/", authMiddleware, clearCart);

export default router;
