import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { orderStatusSchema } from "../utils/schemas.js";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const router = Router();

router.post("/", authMiddleware, authorizeRoles("CUSTOMER"), createOrder);
router.get("/", authMiddleware, getOrders);
router.get("/:id", authMiddleware, getOrderById);
router.patch("/:id/status", authMiddleware, validate(orderStatusSchema), updateOrderStatus);

export default router;
