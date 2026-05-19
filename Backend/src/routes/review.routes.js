import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { reviewSchema } from "../utils/schemas.js";
import {
  createReview,
  getReviews,
  getMyReviews,
  deleteReview,
} from "../controllers/review.controller.js";

const router = Router();

router.get("/", getReviews);
router.get("/my-reviews", authMiddleware, getMyReviews);

router.post("/", authMiddleware, authorizeRoles("CUSTOMER"), validate(reviewSchema), createReview);
router.delete("/:id", authMiddleware, deleteReview);

export default router;
