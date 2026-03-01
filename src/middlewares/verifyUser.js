const ErrorHandler = require("../utils/ErrorHandler");
const { validErrorName, userRole, status } = require("../utils/staticExport");
const { Users } = require("../models");

const verifyUser = async (req, res, next) => {
  try {
    const { id } = req.user;
    if (!id) return next(new ErrorHandler(404, "User id not found", validErrorName.USER_NOT_FOUND));
    const user = await Users.findOne({
      attributer: ["id", "email", "role", "is_email_verified", "status"],
      where: { id },
    });
    if (user.role !== userRole.USER) return next(new ErrorHandler(400, "Access Denied, Due to invalid account role", validErrorName.ACCESS_DENIED));
    if (user.status !== status.ACTIVE)
      return next(new ErrorHandler(400, "Access Denied, User account is inactive.Please connect with the admin", validErrorName.ACCESS_DENIED));
    if (!user.is_email_verified) return next(new ErrorHandler(401, "Please relogin your account"));
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const verifyUserAndUpdatePhone = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { phone = null } = req.body;
    if (!id) return next(new ErrorHandler(404, "User id not found", validErrorName.USER_NOT_FOUND));
    const user = await Users.findOne({
      attributer: ["id", "email", "role", "is_email_verified", "status", "phone"],
      where: { id },
    });
    if (!user) {
      return next(new ErrorHandler(401, "Please login again",validErrorName.USER_NOT_FOUND));
    }
    if (user.role !== userRole.USER) return next(new ErrorHandler(400, "Access Denied, Due to invalid account role", validErrorName.ACCESS_DENIED));
    if (user.status !== status.ACTIVE)
      return next(new ErrorHandler(400, "Access Denied, User account is inactive.Please connect with the admin", validErrorName.ACCESS_DENIED));
    if (!user.is_email_verified) return next(new ErrorHandler(401, "Please relogin your account"));
    if (phone && !user.phone) {
      user.phone = phone;
      await user.save();
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { verifyUser, verifyUserAndUpdatePhone };
