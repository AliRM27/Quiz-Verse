import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]; // Extract token

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.userId = decoded.id;

      return next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};
