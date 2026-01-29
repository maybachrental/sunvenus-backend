const { Sequelize, where, Op } = require("sequelize");
const { buildCarWhere, buildCarSort } = require("../dbHelpers/conditionBuilder");
const { Cars, CarsPricings, CarCategories, FuelTypes, Bookings } = require("../models");
const { responseHandler, getPagination } = require("../utils/helper");
const ErrorHandler = require("../utils/ErrorHandler");
const { validErrorName, tripType } = require("../utils/staticExport");

const fetchAllCars = async (req, res, next) => {
  try {
    const { sort_by = "created_at", duration_hours = 8 } = req.query;
    const condition = buildCarWhere(req.query);
    const { limit, offset, page } = getPagination(req.query.page || 1);
    const order = buildCarSort(sort_by);
    const total = await Cars.count();

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
      where: {
        // location: pickup_location,
        // is_active: true,
        id: { [Op.notIn]: carIds },
      },
      include: [
        {
          model: CarsPricings,
          where: { duration_hours, is_outstation },
          attributes: {
            exclude: ["created_at", "updated_at"],
          },
        },
        { model: CarCategories, attributes: ["category"] },
        { model: FuelTypes, attributes: ["fuel"] },
      ],
      limit,
      offset,
      order: [["created_at", "DESC"]],
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

module.exports = { fetchAllCars, checkCarAvailability };

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
