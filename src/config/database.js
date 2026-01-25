const db = require("../models");

const connectToDB = () => {
  db.sequelize
    .authenticate()
    .then(() => {
      console.log("DB Connection has been established successfully.");
    })
    .catch((err) => {
      console.log("Unable to connect to the database:", err);
    });
};

module.exports = connectToDB;
