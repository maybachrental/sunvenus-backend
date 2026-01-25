const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const connectToDB = require("./src/config/database");
const error = require("./src/middlewares/error");
const ErrorHandler = require("./src/utils/errorHandler");
const PORT = process.env.PORT || 2000;
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
connectToDB();

app.get("/", (req, res) => res.send("Welcome to maybach API!"));
app.use("/api", require("./src/routes/index"));


app.use((req, res, next) => {
  next(new ErrorHandler(404, "The requested URL was not found on this server."));
});

app.use(error);

app.listen(PORT, () => {
  console.log(`Maybach Server Started on http://localhost:${PORT}`);
});
