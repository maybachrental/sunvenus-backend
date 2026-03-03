const multer = require("multer");
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Only image files are allowed"), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = { upload };
