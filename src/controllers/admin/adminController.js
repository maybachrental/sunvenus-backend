const { userRole } = require("../../utils/staticExport");
const { Users } = require("../../models");
const { comparePasswords, hashedPasswordCnv } = require("../../utils/helper");
const { loginDetailsForToken } = require("../../services/auth.service");
const { signAccess } = require("../../config/jwt");

const showAdminRegisterPage = async (req, res, next) => {
  try {
    res.render("admin/createAdmin.ejs", {
      layout: "layout/auth/layout",
    });
  } catch (error) {
    console.log(error);
  }
};

const createAdmin = async (req, res) => {
  try {
    const { email, password, admin_key, name } = req.body;
    if (admin_key !== process.env.ADMIN_SECRET_KEY) {
      req.flash("error", "Invalid Admin Secret");
      return res.redirect(req.header("Referer"));
    }
    const user = await Users.findOne({ where: { email }, paranoid: false });
    if (user) {
      req.flash("error", "User already exists with this email");
      return res.redirect(req.header("Referer"));
    }
    console.log("issue");
    const hashPassword = await hashedPasswordCnv(password);
    await Users.create({
      email,
      name,
      password: hashPassword,
      role: userRole.ADMIN,
    });

    req.flash("success", "Admin created successfully");
    res.redirect("/admin/login");
  } catch (err) {
    req.flash("error", err?.message + "Something went wrong");
    return res.redirect(req.header("Referer"));
  }
};

const showLoginPage = async (req, res, next) => {
  try {
    res.render("admin/login.ejs", {
      layout: "layout/auth/layout",
    });
  } catch (error) {
    console.log(error);
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminUser = await Users.findOne({
      attributes: ["id", "email", "password", "role", "name"],
      where: { email, role: userRole.ADMIN },
    });

    if (!adminUser) {
      req.flash("error", "Account not found with this email");
      return res.redirect(req.get("referer") || "/admin/login");
    }

    const isMatched = await comparePasswords(password, adminUser.password);
    if (!isMatched) {
      req.flash("error", "Wrong password");
      return res.redirect(req.get("referer") || "/admin/login");
    }

    const accessToken = signAccess({
      id: adminUser.id,
      role: adminUser.role,
      email: adminUser.email,
      name: adminUser.name,
    });

    res.cookie("admin_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    req.flash("success", `Welcome back, ${adminUser.name}!`);
    return res.redirect("/admin/dashboard");
  } catch (error) {
    req.flash("error", "Something went wrong. Please try again.");
    return res.redirect(req.get("referer") || "/admin/login");
  }
};

const logoutAdmin = (req, res) => {
  res.clearCookie("admin_access_token");
  res.clearCookie("admin.sid");
  req.flash("success", "Logged out successfully");
  res.redirect("/admin/login");
};
module.exports = { showLoginPage, loginAdmin, logoutAdmin, showAdminRegisterPage, createAdmin };
