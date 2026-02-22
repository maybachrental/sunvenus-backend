const { Op } = require("sequelize");
const { buildCarWhere, buildCarSort } = require("../dbHelpers/conditionBuilder");
const { Cars, CarsPricings, CarCategories, FuelTypes, Bookings, AddOns, Brands } = require("../models");
const { responseHandler, getPagination } = require("../utils/helper");
const ErrorHandler = require("../utils/ErrorHandler");
const { validErrorName, tripTypes } = require("../utils/staticExport");
const { isCarAvailable, calculatePricingLogic } = require("../services/booking.service");
const { triptypeCondition } = require("../services/car.service");

const fetchAllCars = async (req, res, next) => {
  try {
    const { sort_by = "created_at", duration_hours = 8, min_price, max_price } = req.query;
    const condition = buildCarWhere(req.query);
    const { limit, offset, page } = getPagination(req.query.page || 1);
    const order = buildCarSort(sort_by);
    const total = await Cars.count({
      where: { is_active: true },
    });
    // Build pricing filter dynamically
    const pricingWhere = {
      duration_hours,
    };

    if (min_price || max_price) {
      pricingWhere.base_price = {};

      if (min_price) {
        pricingWhere.base_price[Op.gte] = Number(min_price);
      }

      if (max_price) {
        pricingWhere.base_price[Op.lte] = Number(max_price);
      }
    }

    const fetchCars = await Cars.findAll({
      where: condition,
      distinct: true,
      subQuery: false,
      include: [
        {
          model: CarsPricings,
          where: pricingWhere,
          required: true,
          attributes: {
            exclude: ["created_at", "updated_at"],
          },
        },
        { model: CarCategories, attributes: ["category"] },
        { model: FuelTypes, attributes: ["fuel"] },
      ],
      limit,
      offset,
      order,
    });

    const totalPages = Math.ceil(total / limit);

    responseHandler(res, 200, "Cars Fetched Successfully", {
      cars: fetchCars,
      totalCars: total,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

const fetchPremiumCars = async (req, res, next) => {
  try {
    const fetchCars = await Cars.findAll({
      where: { is_premium: true },
      distinct: true,
      subQuery: false,
      include: [
        {
          model: CarsPricings,
          required: true,
          limit: 1,
          attributes: {
            exclude: ["created_at", "updated_at"],
          },
        },
        { model: CarCategories, attributes: ["category"] },
        { model: FuelTypes, attributes: ["fuel"] },
      ],
      limit: 7,
      order: [["order_by", "ASC"]],
    });
    const bgColors = ["#EAD5D3", "#B2A8D5", "#92DFCF", "#48467D", "#f8dd9f", "#B2A8D5", "#92DFCF", "#48467D"];
    const updatedCars =
      fetchCars && fetchCars.length > 0
        ? fetchCars.map((item, i) => {
            const itemJson = item.toJSON();
            return {
              ...itemJson,
              bgColor: bgColors[i] || "#92DFCF",
            };
          })
        : [];

    responseHandler(res, 200, "Feteh Cars", { fetchCars: updatedCars });
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

const checkCarAvailability = async (req, res, next) => {
  try {
    const { trip_type, pickup_datetime, drop_datetime = null, duration_hours = 8, sort_by = "newest", included_km = 80 } = req.body;

    if (!trip_type || !pickup_datetime) {
      return next(new ErrorHandler(400, "All fields are required", validErrorName.INVALID_PASSWORD));
    }
    const pickupDateTime = new Date(pickup_datetime);
    const dropDateTime = triptypeCondition(trip_type, pickupDateTime, duration_hours, drop_datetime);

    const order = buildCarSort(sort_by);

    if (pickupDateTime >= dropDateTime) {
      return next(new ErrorHandler(400, "Drop date/time must be after pickup date/time", validErrorName.INVALID_REQUEST));
    }

    const is_outstation = trip_type === tripTypes.ROUND_TRIP ? true : false;

    const bookedCarIds = await Bookings.findAll({
      attributes: ["car_id"],
      where: {
        booking_status: { [Op.in]: ["CONFIRMED", "ONGOING", "PENDING_PAYMENT"] },
        pickup_datetime: { [Op.lt]: dropDateTime },
        drop_datetime: { [Op.gt]: pickupDateTime },
      },
      group: ["car_id"],
    });

    const carIds = bookedCarIds.map((b) => b.car_id);
    const { limit, offset, page } = getPagination(req.query.page || 1);

    const availableCars = await Cars.findAndCountAll({
      distinct: true,
      subQuery: false, // prevents broken ORDER BY subquery
      where: {
        is_active: true,
        id: { [Op.notIn]: carIds },
      },
      include: [
        {
          model: CarsPricings,
          where: is_outstation ? { is_outstation } : { duration_hours, is_outstation, included_km },
          required: true,
          attributes: {
            exclude: ["created_at", "updated_at"],
          },
        },
        { model: CarCategories, attributes: ["category"], required: false },
        { model: FuelTypes, attributes: ["fuel"], required: false },
      ],
      order,
      limit,
      offset,
      logging: false,
    });

    const totalPages = Math.ceil(availableCars.count / limit);
    responseHandler(res, 200, "Car fetched", {
      cars: availableCars.rows,
      totalCars: availableCars.count,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

const fetchCarDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return next(new ErrorHandler(404, "Car id not found"));

    const carInfo = await Cars.findOne({
      where: { id },
      attributes: {
        exclude: ["created_at", "updated_at"],
      },
      include: [{ model: CarsPricings }, { model: CarCategories }, { model: FuelTypes }],
    });

    responseHandler(res, 200, "Car Information", { carInfo });
  } catch (error) {
    next(error);
  }
};

const fetchSingleCarForBooking = async (req, res, next) => {
  try {
    const { car_id } = req.params;
    if (!car_id) return next(new ErrorHandler(404, "Car id not found"));

    const { trip_type, pickup_datetime, drop_datetime = null, duration_hours = 8, included_km = 80 } = req.query;
    if (!pickup_datetime || !trip_type) {
      return next(new ErrorHandler(400, "Missing Parameters"));
    }
    const pickupDateTime = new Date(pickup_datetime);
    const dropDateTime = triptypeCondition(trip_type, pickupDateTime, duration_hours, drop_datetime);
    const available = await isCarAvailable(car_id, pickupDateTime, dropDateTime);
    if (!available) {
      return next(
        new ErrorHandler(400, "Oops! You are late, Car is no longer available. Please select another Car.", validErrorName.CAR_ALREADY_BOOKED),
      );
    }
    const whereQuery = {
      is_outstation: trip_type === tripTypes.ROUND_TRIP ? true : false,
    };
    if (trip_type !== tripTypes.ROUND_TRIP) {
      whereQuery.duration_hours = duration_hours;
      whereQuery.included_km = included_km;
    }
    const CarsPricingsInfo = await Cars.findOne({
      where: { id: car_id },
      include: [
        {
          model: CarsPricings,
          where: whereQuery,
          limit: 1,
          required: true,
        },
        { model: CarCategories, attributes: ["category"], required: false },
        { model: FuelTypes, attributes: ["fuel"], required: false },
      ],
    });
    responseHandler(res, 200, "Car Pricing Information", { carData: CarsPricingsInfo });
  } catch (error) {
    next(error);
  }
};

const fetchEstimatePrice = async (req, res, next) => {
  try {
    const { duration_hours = 8, included_km = 80, trip_type, extra = null, car_id } = req.body;

    if (!car_id) return next(new ErrorHandler(404, "Car id not found"));
    if (!trip_type) return next(new ErrorHandler(404, "Trip Type not found"));

    const estimated_price = await calculatePricingLogic(car_id, trip_type, duration_hours, included_km, extra);

    responseHandler(res, 200, "Estimated Price", { estimatePrice: estimated_price });
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
module.exports = {
  fetchAllCars,
  checkCarAvailability,
  fetchCarDetails,
  fetchSingleCarForBooking,
  fetchEstimatePrice,
  fetchAllBrands,
  fetchPremiumCars,
  fetchFilterData,
};
