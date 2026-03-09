const { userRole } = require("../../utils/staticExport");
const { Users, Cars, Bookings, Brands, FuelTypes } = require("../../models");
const { comparePasswords, hashedPasswordCnv } = require("../../utils/helper");
const { loginDetailsForToken } = require("../../services/auth.service");
const { signAccess } = require("../../config/jwt");
const { Op } = require("sequelize");

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
    console.log(accessToken);
    
    res.cookie("admin_access_token", accessToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      // sameSite: "strict",
      secure: false, // because HTTP
      sameSite: "lax",
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

const showAllBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const { search = "", booking_status = "", payment_status = "", date_from = null, date_to = null } = req.query;

    let bookingWhere = {};
    const carWhere = {};

    if (booking_status) {
      bookingWhere.booking_status = booking_status;
    }

    if (payment_status) {
      bookingWhere.payment_status = payment_status;
    }

    if (search) {
      carWhere.name = { [Op.like]: `%${search}%` };
    }
    if (date_from || date_to) {
      bookingWhere.pickup_datetime = {};
      if (date_from) {
        bookingWhere.pickup_datetime[Op.gte] = new Date(date_from + "T00:00:00");
      }
      if (date_to) {
        bookingWhere.pickup_datetime[Op.lte] = new Date(date_to + "T23:59:59");
      }
    }
    const { rows: bookings, count } = await Bookings.findAndCountAll({
      where: bookingWhere,
      include: [
        {
          model: Cars,
          where: carWhere,
        },
        {
          model: Users,
        },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    res.render("admin/showBookings", {
      bookings,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      query: req.query,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

const showAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const { search = "", role = "", is_active = "", date_from = "", date_to = "" } = req.query;

    const userWhere = {};

    // Search by name or email
    if (search) {
      userWhere[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }];
    }

    // Filter by role
    if (role) {
      userWhere.role = role;
    }

    // Filter by active status
    if (is_active) {
      userWhere.status = is_active;
    }

    // Filter by joined date range
    if (date_from || date_to) {
      userWhere.created_at = {};
      if (date_from) {
        userWhere.created_at[Op.gte] = new Date(date_from + "T00:00:00");
      }
      if (date_to) {
        userWhere.created_at[Op.lte] = new Date(date_to + "T23:59:59");
      }
    }

    const { rows: users, count } = await Users.findAndCountAll({
      where: userWhere,
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    res.render("admin/showUsers", {
      users,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      query: req.query,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

const showAllCars = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const { search = "", fuel_type = "", is_active = "", transmission = "" } = req.query;

    const carWhere = {};

    // Search by name or brand
    if (search) {
      carWhere[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { model: { [Op.like]: `%${search}%` } }];
    }

    // Filter by fuel type
    if (fuel_type) {
      carWhere.fuel_type = fuel_type;
    }

    // Filter by availability
    if (is_active !== "") {
      carWhere.is_active = is_active === "true";
    }

    // Filter by transmission
    if (transmission) {
      carWhere.transmission = transmission;
    }

    const { rows: cars, count } = await Cars.findAndCountAll({
      where: carWhere,
      include: [
        {
          model: Brands,
          attributes: ["brand_name"],
        },
        {
          model: FuelTypes,
          attributes: ["fuel"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    res.render("admin/showCars", {
      cars,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      query: req.query,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

module.exports = { showLoginPage, loginAdmin, logoutAdmin, showAdminRegisterPage, createAdmin, showAllBookings, showAllCars, showAllUsers };
