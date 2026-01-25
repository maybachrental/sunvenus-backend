const ErrorHandler = require("../utils/errorHandler");
const { validErrorName } = require("../utils/staticExport");
const { BlacklistTokens } = require("../models");
const { verifyResetToken } = require("../config/jwt");

async function checkIsTokenBlacklist(req, res, next) {
  try {
    const { reset_token } = req.body;
    if (!reset_token) {
      return next(new ErrorHandler(400, "Token not provided", validErrorName.ACCESS_DENIED));
    }
    const isBlacklisted = await BlacklistTokens.findOne({ where: { access_token: reset_token } });
    if (isBlacklisted) {
      return next(new ErrorHandler(401, "Unauthorized: This token is blacklisted", validErrorName.BLACKLISTED_TOKEN));
    }
    const data = verifyResetToken(reset_token);
    req.resetUserData = data;
    return next();
  } catch (error) {
    next(error);
  }
}

module.exports = { checkIsTokenBlacklist };
