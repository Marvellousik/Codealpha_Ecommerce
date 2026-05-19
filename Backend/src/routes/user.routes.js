import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { userUpdateSchema, userRoleUpdateSchema } from "../utils/schemas.js";
import {
  getMe,
  updateMe,
  getUsers,
  updateUserRole,
  deleteUser,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/me", authMiddleware, getMe);
router.patch("/me", authMiddleware, validate(userUpdateSchema), updateMe);

router.get("/", authMiddleware, authorizeRoles("ADMIN"), getUsers);
router.patch("/:id/role", authMiddleware, authorizeRoles("ADMIN"), validate(userRoleUpdateSchema), updateUserRole);
router.delete("/:id", authMiddleware, authorizeRoles("ADMIN"), deleteUser);

export default router;
