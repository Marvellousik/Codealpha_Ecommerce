import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  try {
    // 1. get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // format: "Bearer token"
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    // 2. verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. attach user info to request
    req.user = decoded;

    // 4. continue to next function
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
}