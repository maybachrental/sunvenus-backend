const fallback = async (req, res, next) => {
  const referer = req.headers["referer"] || "/admin/dashboard"; // fallback if no referer
  return res.redirect(referer);
};

module.exports = { fallback };
