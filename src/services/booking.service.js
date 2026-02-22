const { Op } = require("sequelize");
const { Bookings, CarsPricings, AddOns } = require("../models");
const ErrorHandler = require("../utils/ErrorHandler");
const { tripTypes } = require("../utils/staticExport");

const isCarAvailable = async (car_id, pickupDateTime, dropDateTime, transaction = null) => {
  if (pickupDateTime >= dropDateTime) {
    return next(new ErrorHandler(400, "Drop date/time must be after pickup date/time", validErrorName.INVALID_REQUEST));
  }
  const existingBooking = await Bookings.findOne({
    where: {
      car_id,
      booking_status: { [Op.in]: ["CONFIRMED", "ONGOING", "PENDING_PAYMENT"] },
      pickup_datetime: { [Op.lt]: dropDateTime },
      drop_datetime: { [Op.gt]: pickupDateTime },
    },
    ...(transaction && {
      lock: transaction.LOCK.UPDATE,
      transaction,
    }),
  });

  return !existingBooking; // true if available
};

const calculatePricingLogic = async (car_id, trip_type, duration_hours, included_km, extra = []) => {
  const whereQuery = {
    car_id: car_id,
    is_outstation: trip_type === tripTypes.ROUND_TRIP ? true : false,
  };

  if (trip_type === tripTypes.LOCAL) {
    whereQuery.duration_hours = duration_hours;
    whereQuery.included_km = included_km;
  }
  const carPricing = await CarsPricings.findOne({
    where: whereQuery,
  });

  if (!carPricing) {
    return next(new ErrorHandler(404, "Pricing information not found for the specified duration and trip type"));
  }
  const carPrices = carPricing.get({ plain: true });
  const extraJson = extra ? extra : [];

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
  return estimated_price;
};

module.exports = { isCarAvailable, calculatePricingLogic };
