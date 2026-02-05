const { Op } = require("sequelize");
const { buildCarWhere, buildCarSort } = require("../dbHelpers/conditionBuilder");
const { Cars, CarsPricings, CarCategories, FuelTypes, Bookings, AddOns } = require("../models");
const { responseHandler, getPagination } = require("../utils/helper");
const ErrorHandler = require("../utils/ErrorHandler");
const { validErrorName, tripType } = require("../utils/staticExport");
const { isCarAvailable } = require("../services/booking.service");

const fetchAllCars = async (req, res, next) => {
  try {
    const { sort_by = "created_at", duration_hours = 8 } = req.query;
    const condition = buildCarWhere(req.query);
    const { limit, offset, page } = getPagination(req.query.page || 1);
    const order = buildCarSort(sort_by);
    const total = await Cars.count({
      where: { is_active: true },
    });

    const fetchCars = await Cars.findAll({
      where: condition,
      distinct: true,
      subQuery: false,
      include: [
        {
          model: CarsPricings,
          where: { duration_hours },
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

const checkCarAvailability = async (req, res, next) => {
  try {
    const {
      trip_type,
      pickup_location,
      drop_location,
      pickup_date,
      pickup_time,
      drop_date,
      drop_time,
      duration_hours = 8,
      sort_by = "newest",
    } = req.body;

    if (!pickup_location || !drop_location || !pickup_date || !pickup_time || !drop_date || !drop_time) {
      return next(new ErrorHandler(400, "All fields are required", validErrorName.INVALID_PASSWORD));
    }

    const pickupDateTime = new Date(`${pickup_date} ${pickup_time}`);
    const dropDateTime = new Date(`${drop_date} ${drop_time}`);
    const order = buildCarSort(sort_by);
    if (pickupDateTime >= dropDateTime) {
      return next(new ErrorHandler(400, "Drop date/time must be after pickup date/time", validErrorName.INVALID_REQUEST));
    }
    const is_outstation = trip_type === "OUTSTATION" ? true : false;
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
      subQuery: false, // ⭐ prevents broken ORDER BY subquery
      where: {
        is_active: true,
        id: { [Op.notIn]: carIds },
      },
      include: [
        {
          model: CarsPricings,
          where: { duration_hours, is_outstation },
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
      availableCars: availableCars.rows,
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
    const { id } = req.params;
    if (!id) return next(new ErrorHandler(404, "Car id not found"));
    const {
      pickup_location,
      drop_location,
      pickup_date,
      pickup_time,
      drop_date,
      drop_time,
      duration_hours = 8,
      trip_type = "OUTSTATION",
    } = req.query;
    if (!pickup_date || !pickup_time || !drop_date || !drop_time) {
      return next(new ErrorHandler(400, "Missing Parameters"));
    }
    const pickupDateTime = new Date(`${pickup_date} ${pickup_time}`);
    const dropDateTime = new Date(`${drop_date} ${drop_time}`);
    const available = await isCarAvailable(id, pickupDateTime, dropDateTime);
    if (!available) {
      return next(
        new ErrorHandler(400, "Oops! You are late, Car is no longer available. Please select another Car.", validErrorName.CAR_ALREADY_BOOKED),
      );
    }
    const whereQuery = {
      is_outstation: trip_type === "OUTSTATION" ? true : false,
    };
    if (trip_type === "LOCAL") {
      whereQuery.duration_hours = duration_hours;
    }
    const CarsPricingsInfo = await Cars.findOne({
      where: { id },
      include: [
        {
          model: CarsPricings,
          where: whereQuery,
          limit: 1,
        },
        { model: CarCategories, attributes: ["category"], required: false },
        { model: FuelTypes, attributes: ["fuel"], required: false },
      ],
    });
    responseHandler(res, 200, "Car Pricing Information", { CarsPricingsInfo });
  } catch (error) {
    next(error);
  }
};

const fetchEstimatePrice = async (req, res, next) => {
  try {
    const { duration_hours = 8, trip_type = "OUTSTATION", extra = [], car_id } = req.body;

    if (!car_id) return next(new ErrorHandler(404, "Car id not found"));

    const whereQuery = {
      car_id: car_id,
      is_outstation: trip_type === "OUTSTATION" ? true : false,
    };

    if (trip_type === "LOCAL") {
      whereQuery.duration_hours = duration_hours;
    }
    const carPricing = await CarsPricings.findOne({
      where: whereQuery,
    });

    if (!carPricing) {
      return next(new ErrorHandler(404, "Pricing information not found for the specified duration and trip type"));
    }
    const carPrices = carPricing.get({ plain: true });
    const extraJson = JSON.parse(req.body.extra);

    const ids = extraJson.map((e) => {
      return e.id;
    });

    const fetchAddOns = await AddOns.findAll({
      attributes: ["id", "price", "type", "duration"],
      where: { id: { [Op.in]: ids } },
      raw: true,
    });
    const estimated_price = {
      ...carPrices,
      extra: [],
      total_price: carPrices.base_price,
    };
    if (fetchAddOns) {
      estimated_price.extra = [...fetchAddOns];
      fetchAddOns.forEach((element) => {
        estimated_price.total_price += typeof element.price === "string" ? Number(element.price) : element.price;
      });
    }

    responseHandler(res, 200, "Estimated Price", { estimated_price });
  } catch (error) {
    next(error);
  }
};

module.exports = { fetchAllCars, checkCarAvailability, fetchCarDetails, fetchSingleCarForBooking, fetchEstimatePrice };

// const availableCars = await Cars.findAll({
//   where: {
//     location: pickup_location,
//     is_active: true,
//   },

//   include: [
//     {
//       model: Bookings,
//       required: false, // LEFT JOIN
//       where: {
//         booking_status: {
//           [Op.in]: ["CONFIRMED", "ONGOING"],
//         },
//         pickup_datetime: {
//           [Op.lt]: dropDateTime,
//         },
//         drop_datetime: {
//           [Op.gt]: pickupDateTime,
//         },
//       },
//     },
//   ],

//   having: Sequelize.literal("COUNT(bookings.id) = 0"),

//   group: ["Car.id"],
// });
