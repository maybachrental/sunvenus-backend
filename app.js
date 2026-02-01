const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const connectToDB = require("./src/config/database");
const error = require("./src/middlewares/error");
const ErrorHandler = require("./src/utils/ErrorHandler");
const path = require("path");
const PORT = process.env.PORT || 2000;
// json Conversion
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

// DB connection
connectToDB();

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));
app.use(require("express-ejs-layouts"));
app.set("layout", "layout/admin/layout");
// Static files
app.use("/adminlte", express.static(path.join(__dirname, "./node_modules/admin-lte")));
app.use("/bootstrap", express.static(path.join(__dirname, "./node_modules/bootstrap")));
app.use("/popper", express.static(path.join(__dirname, "./node_modules/@popperjs/core")));
app.use(express.static(path.join(__dirname, "/public")));

// APIS
app.get("/", (req, res) => res.json("Welcome to maybach API!"));
app.use("/api", require("./src/routes/index"));
app.use("/admin",require("./src/routes/admin/adminRoutes"))

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
