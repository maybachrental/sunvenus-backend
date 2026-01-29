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

const getPagination = (pageNumber = 1, pageSize = 10) => {
  const page = Math.max(parseInt(pageNumber, 10) || 1, 1);
  const limit = Math.max(parseInt(pageSize, 10) || 10, 1);
  const offset = (page - 1) * limit;

  return {
    limit,
    offset,
    page,
    pageSize: limit,
  };
};

function generateBookingCode() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(100 + Math.random() * 900);
  return `MBX-${date}-${rand}`;
}

module.exports = { responseHandler, generateOTP, hashedPasswordCnv, comparePasswords, getPagination, generateBookingCode };
