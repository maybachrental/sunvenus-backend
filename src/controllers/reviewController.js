const { Reviews } = require("../models");
const { getPagination, responseHandler } = require("../utils/helper");

const getAllReviews = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query.page || 1);
    const reviews = await Reviews.findAndCountAll({
      where: { status: "APPROVED" },
      offset,
      limit,
      order: [["created_at", "DESC"]],
    });

    responseHandler(res, 200, "Reviews", {
      reviews: reviews.rows,
      currentPage: page,
      totalPages: Math.ceil(reviews.count / limit),
      totalReviews: reviews.count,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllReviews };
