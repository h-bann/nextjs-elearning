import jwt from "jsonwebtoken";

export function createToken(user, options = {}) {
  const payload = {
    userId: user.user_id,
    email: user.email,
    role: user.role || "user",
  };

  const defaultOptions = {
    expiresIn: "24h", // 24 hours
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    ...defaultOptions,
    ...options,
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error("Token verification error:", error.message);
    return null;
  }
}
