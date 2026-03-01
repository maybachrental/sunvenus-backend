const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const connectToDB = require("./src/config/database");
const error = require("./src/middlewares/error");
const ErrorHandler = require("./src/utils/ErrorHandler");
const path = require("path");
const PORT = process.env.PORT || 2000;
const session = require("express-session");
const flash = require("connect-flash");
const { helperMessage } = require("./src/middlewares/adminAuth");
const cookieParser = require("cookie-parser");
const startPendingBookingCleanup = require("./src/cronJobs/cancelBookings");

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// json Conversion
app.use("/webhooks", express.raw({ type: "application/json" }), require("./src/routes/webhookRoutes"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

// i want to log the request method and url for every incoming request

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// DB connection
connectToDB();

// session
app.use(
  session({
    name: "admin.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    secure: process.env.NODE_ENV === "production",
    saveUninitialized: false,
    cookie: {
      maxAge: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
      httpOnly: true,
      secure: false, // true if using HTTPS
    },
  }),
);

// flash
app.use(flash());

app.use((req, res, next) => {
  res.locals.flash = {
    success: req.flash("success"),
    error: req.flash("error"),
    info: req.flash("info"),
  };
  next();
});

app.use(helperMessage);

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));
app.use(require("express-ejs-layouts"));
app.set("layout", "layout/admin/layout");

// cron jobs
startPendingBookingCleanup()

// Static files
app.use("/adminlte", express.static(path.join(__dirname, "./node_modules/admin-lte")));
app.use("/bootstrap", express.static(path.join(__dirname, "./node_modules/bootstrap")));
app.use("/popper", express.static(path.join(__dirname, "./node_modules/@popperjs/core")));
app.use(express.static(path.join(__dirname, "/public")));

// APIS
app.get("/", (req, res) => res.json("Welcome to maybach API!"));
app.use("/api", require("./src/routes/index"));
app.use("/admin", require("./src/routes/admin/adminRoutes"));

// middlewaare for all
app.use((req, res, next) => {
  next(new ErrorHandler(404, "The requested URL was not found on this server."));
});

// error middleware
app.use(error);

// PORT running here
app.listen(PORT, () => {
  console.log(`Maybach Server Started on http://localhost:${PORT}`);
});
