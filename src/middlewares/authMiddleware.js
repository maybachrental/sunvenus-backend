const ErrorHandler = require("../utils/ErrorHandler");
const { validErrorName } = require("../utils/staticExport");
const { BlacklistTokens } = require("../models");
const { verifyResetToken, verifyAccess } = require("../config/jwt");

async function checkIsTokenBlacklist(req, res, next) {
  try {
    const { reset_token } = req.body;
    if (!reset_token) {
      return next(new ErrorHandler(400, "Token not provided", validErrorName.ACCESS_DENIED));
    }
    const isBlacklisted = await BlacklistTokens.findOne({ where: { access_token: reset_token } });
    if (isBlacklisted) return next(new ErrorHandler(401, "Unauthorized: This token is blacklisted", validErrorName.BLACKLISTED_TOKEN));

    const data = verifyResetToken(reset_token);
    req.resetUserData = data;
    return next();
  } catch (error) {
    next(error);
  }
}

async function authenicateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];

    if (!authHeader || !token) return next(new ErrorHandler(401, "Access token missing", validErrorName.UNAUTHORIZED_USER));

    const isBlacklisted = await BlacklistTokens.findOne({ where: { access_token: token } });

    if (isBlacklisted) return next(new ErrorHandler(401, "Unauthorized: Token has been revoked", validErrorName.UNAUTHORIZED_USER));

    const payload = verifyAccess(token);
    req.user = payload;

    next();
  } catch (error) {
    return next(new ErrorHandler(401, "User not authorized", validErrorName.UNAUTHORIZED_USER));
  }
}

module.exports = { checkIsTokenBlacklist, authenicateUser };
