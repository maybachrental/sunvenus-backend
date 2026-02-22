const crypto = require("crypto");

function generatePrefixedId(prefix, length = 15) {
  const randomPart = crypto
    .randomBytes(10)
    .toString("hex")
    .toUpperCase()
    .slice(0, length - prefix.length);

  return prefix + randomPart;
}

module.exports = { generatePrefixedId };
