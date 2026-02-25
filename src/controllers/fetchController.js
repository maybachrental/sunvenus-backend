const { googleDistanceApi } = require("../services/external/google.service");
const { responseHandler } = require("../utils/helper");
const { AddOns, Discount, Brands, CarCategories, FuelTypes } = require("../models");
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
    const discounts = await Discount.findAll({
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

module.exports = { fetchDistanceMatrix, fetchAddOnsAndDiscount, fetchAllBrands, fetchFilterData };
