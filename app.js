const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const PORT = process.env.PORT || 2000;

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

app.get("/", (req, res) => res.send("Welcome to Fyinder API!"));

app.listen(PORT, () => {
  console.log(`Maybach Server Started on http://localhost:${PORT}`);
});
