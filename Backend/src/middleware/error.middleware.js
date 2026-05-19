export function errorHandler(err, req, res, next) {
  console.error("[Global Error]:", err);

  // Handle Prisma known errors gracefully
  if (err.code && err.code.startsWith("P")) {
    let message = "Database error";
    let status = 500;

    if (err.code === "P2002") {
      message = "A record with this value already exists";
      status = 409;
    } else if (err.code === "P2025") {
      message = "Record not found";
      status = 404;
    } else if (err.code === "P2003") {
      message = "Related record not found or constraint violation";
      status = 400;
    }

    return res.status(status).json({
      success: false,
      error: message,
    });
  }

  // Zod validation errors passed through
  if (err.name === "ZodError" || Array.isArray(err.errors)) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: err.errors || err.issues,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
}
