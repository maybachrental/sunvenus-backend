const { verifyAccess } = require("../config/jwt");
const { userRole } = require("../utils/staticExport");

const isAdminAuth = (req, res, next) => {
  try {
    const token = req.cookies?.admin_access_token;

    if (!token) {
      req.flash("error", "Please login first");
      return res.redirect("/admin/login");
    }

    const decoded = verifyAccess(token);

    if (decoded.role !== userRole.ADMIN) {
      req.flash("error", "Unauthorized access");
      return res.redirect("/admin/login");
    }

    req.admin = decoded; // accessible in controllers/views
    next();
  } catch (error) {
    req.flash("error", error?.message || "Session expired. Please login again.");
    return res.redirect("/admin/login");
  }
};

const preventAdminLogin = (req, res, next) => {
  try {
    const token = req.cookies.admin_access_token;

    if (!token) {
      return next(); // not logged in → allow access to login page
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded && decoded.role === "ADMIN") {
      return res.redirect("/admin/dashboard");
    }

    next();
  } catch (error) {
    // token invalid or expired → allow login page
    return next();
  }
};

const helperMessage = (req, res, next) => {
  const token = req.cookies.admin_access_token;

  if (!token) {
    res.locals.admin = null;
    return next();
  }

  try {
    const decoded = verifyAccess(token, process.env.JWT_SECRET);

    if (decoded.role === userRole.ADMIN) {
      res.locals.admin = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name,
      };
    } else {
      res.locals.admin = null;
    }
  } catch (error) {
    // token expired / invalid
    res.locals.admin = null;
  }

  next();
};
module.exports = { isAdminAuth, preventAdminLogin, helperMessage };
