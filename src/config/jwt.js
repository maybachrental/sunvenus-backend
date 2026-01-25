const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

function signAccess(payload) {
  payload.jti = uuidv4();
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_TTL || "15m" });
}

function resetToken(payload) {
  payload.jti = uuidv4();
  return jwt.sign(payload, process.env.JWT_RESET_TOKEN, { expiresIn: process.env.RESET_TOKEN_TTL || "10m" });
}

// function tempToken(payload) {
//   payload.jti = uuidv4();
//   return jwt.sign(payload, process.env.JWT_TEMP_SECRET, { expiresIn: process.env.TEMP_TOKEN_TTL || "1hr" });
// }

function verifyAccess(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

function verifyResetToken(token) {
  return jwt.verify(token, process.env.JWT_RESET_TOKEN);
}

// function verifyTempToken(token) {
//   return jwt.verify(token, process.env.JWT_TEMP_SECRET);
// }

module.exports = {
  signAccess,
  verifyAccess,
  resetToken,
  verifyResetToken
};
