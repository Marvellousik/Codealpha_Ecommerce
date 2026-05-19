import { z } from "zod";

export const registerSchema = z.object({
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
    required_error: "Role is required (CUSTOMER or SELLER)",
  }),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be a positive number"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative").default(0),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  categoryId: z.string().min(1, "Category ID is required"),
});

export const productUpdateSchema = productSchema.partial();

export const cartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
});

export const cartItemUpdateSchema = z.object({
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
});

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export const reviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export const categoryUpdateSchema = categorySchema.partial();

export const storefrontConfigSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.any(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const storefrontConfigUpdateSchema = storefrontConfigSchema.partial();

export const userUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
});

export const userRoleUpdateSchema = z.object({
  role: z.enum(["CUSTOMER", "SELLER", "ADMIN"]),
});
