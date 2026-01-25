module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  const errorMessage = {
    message: err.message || "Something went wrong.",
    errName: err.name || "UnknownError",
    success: false,
    statusCode,
  };
  // If Sequelize error → mask the message
  if (err.name && err.name.includes("Sequelize")) {
    errorMessage.message = "Something went wrong.";
    errorMessage.errName = "DatabaseError";
    errorMessage.dev = err;
  }
  if (err.errors) {
    errorMessage.errors = err.errors;
  }
  console.log(err, "logError");

  res.status(statusCode).json(errorMessage);
};
