const bcrypt = require("bcrypt");

function responseHandler(res, statusCode, message = "Success", data = null, success = true) {
  const response = {
    statusCode,
    success,
    message: message,
  };
  if (data) response.data = data;
  return res.status(statusCode).json(response);
}
function generateOTP() {
  let otp = "";
  do {
    otp = Math.floor(100000 + Math.random() * 900000).toString();
  } while (otp.length !== 6);
  return otp;
}

const hashedPasswordCnv = async (password) => {
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

const comparePasswords = async (password, hashedPassword) => {
  const isPasswordValid = await bcrypt.compare(password, hashedPassword);
  return isPasswordValid;
};
module.exports = { responseHandler, generateOTP, hashedPasswordCnv, comparePasswords };
