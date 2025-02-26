import jwt from "jsonwebtoken";

/**
 * Create a JWT token for authentication
 *
 * @param {Object} user - User object
 * @param {Object} options - JWT options
 * @returns {string} JWT token
 */
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

/**
 * Verify a JWT token and return payload
 *
 * @param {string} token - JWT token string
 * @returns {Object|null} Decoded payload or null if invalid
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error("Token verification error:", error.message);
    return null;
  }
}
