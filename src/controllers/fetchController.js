const { googleDistanceApi } = require("../services/external/google.service");
const { responseHandler, getPagination } = require("../utils/helper");
const { AddOns, Discounts, Brands, CarCategories, FuelTypes, Blogs, BlogSections, BlogFeatures } = require("../models");
const ErrorHandler = require("../utils/ErrorHandler");
const { validErrorName } = require("../utils/staticExport");
const fetchDistanceMatrix = async (req, res, next) => {
  try {
    const results = await googleDistanceApi(req.body);
    return responseHandler(res, 200, "Fetch Distance", { results });
  } catch (error) {
    console.error("Distance Matrix Error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch distance data",
      error: error.response?.data || error.message,
    });
  }
};

const fetchAddOnsAndDiscount = async (req, res, next) => {
  try {
    const addOns = await AddOns.findAll({
      attributes: ["id", "type", "price", "duration", "extra"],
    });
    const discounts = await Discounts.findAll({
      attributes: ["id", "code", "value", "type", "expiry_date"],
    });
    responseHandler(res, 200, "Fetched", { discounts, addOns });
  } catch (error) {
    next(error);
  }
};

const fetchAllBrands = async (req, res, next) => {
  try {
    const brands = await Brands.findAll({
      attributes: ["brand_name", "brand_img", "id"],
      raw: true,
    });
    responseHandler(res, 200, "Fetched Brands", { brands });
  } catch (error) {
    next(error);
  }
};

const fetchFilterData = async (req, res, next) => {
  try {
    const fetchCategories = await CarCategories.findAll({
      attributes: ["category", "id"],
    });
    const fetchFuelTypes = await FuelTypes.findAll({
      attributes: ["fuel", "id"],
    });
    responseHandler(res, 200, "Fetched Data", { categories: fetchCategories, fuelTypes: fetchFuelTypes });
  } catch (error) {
    next(error);
  }
};

const fetchAllBlogs = async (req, res, next) => {
  try {
    const { limit, offset, page, pageSize } = getPagination(req.query.page || 1);
    const blogs = await Blogs.findAndCountAll({
      distinct: true,
      subQuery: false,
      where: {
        status: "published",
      },
      include: [
        {
          model: BlogSections,
          as: "sections",
          required: false,
          where: { section_type: "IMAGE" },
          attributes: ["image_url", "section_type"],
        },
      ],
      limit,
      offset,
      order: [["created_at", "desc"]],
    });
    responseHandler(res, 200, "Blogs", {
      blogs: blogs.rows,
      currentPage: page,
      totalPage: Math.ceil(blogs.count / limit),
      totalBlogs: blogs.count,
    });
  } catch (error) {
    next(error);
  }
};

const fetchSingleBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new ErrorHandler(400, "Invalid Request", validErrorName.BAD_REQUEST);
    }
    const blog = await Blogs.findOne({
      subQuery: false,
      where: {
        status: "published",
        id,
      },
      include: [
        {
          model: BlogSections,
          as: "sections",
        },
        {
          model: BlogFeatures,
          as: "features",
        },
      ],
    });
    if (!blog) {
      throw new ErrorHandler(404, "Blog not found", validErrorName.NOT_FOUND);
    }
    responseHandler(res, 200, "Blog Details", { blog });
  } catch (error) {
    next(error);
  }
};

module.exports = { fetchDistanceMatrix, fetchAddOnsAndDiscount, fetchAllBrands, fetchFilterData, fetchAllBlogs, fetchSingleBlog };
