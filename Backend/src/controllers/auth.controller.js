import bcrypt from "bcrypt";
import { z } from "zod";
import prisma from "../config/db.js";
import { signToken } from "../utils/jwt.js";

// --- Zod Validation Schemas ---
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  role: z.enum(["CUSTOMER", "SELLER"], {
    invalid_type_error: "Role must be CUSTOMER or SELLER",
    required_error: "Role is required. Choose CUSTOMER or SELLER.",
  }),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// --- Controllers ---

export async function register(req, res) {
  try {
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validationResult.error.errors,
      });
    }

    const { email, password, name, role } = validationResult.data;

    // Check for existing user with ANY role
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "An account with this email already exists. Each email can only be registered as one account type.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    const token = signToken({
      userId: user.id,
      role: user.role,
    });

    const { password: _, ...safeUser } = user;

    return res.status(201).json({
      success: true,
      data: {
        user: safeUser,
        token,
      },
    });
  } catch (error) {
    console.error("[Auth Register Error]:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

export async function login(req, res) {
  try {
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validationResult.error.errors,
      });
    }

    const { email, password } = validationResult.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    const token = signToken({
      userId: user.id,
      role: user.role,
    });

    const { password: _, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      data: {
        user: safeUser,
        token,
      },
    });
  } catch (error) {
    console.error("[Auth Login Error]:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
