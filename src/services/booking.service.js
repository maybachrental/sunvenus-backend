const { Op } = require("sequelize");
const { Bookings, CarsPricings, AddOns, Discounts } = require("../models");
const ErrorHandler = require("../utils/ErrorHandler");
const { tripTypes, validErrorName } = require("../utils/staticExport");
const { roundTripPriceCalculate } = require("./car.service");
const { googleDistanceApi } = require("./external/google.service");

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

const calculatePricingLogic = async (
  car_id,
  trip_type,
  duration_hours,
  included_km,
  addOn = [],
  destinations,
  pickup_datetime,
  drop_datetime,
  discounts = [],
) => {
  const whereQuery = {
    car_id: car_id,
    is_outstation: trip_type === tripTypes.ROUND_TRIP ? true : false,
  };

  let distanceData = null;
  if (whereQuery.is_outstation && destinations) {
    distanceData = await googleDistanceApi({
      origin: "19.151394734760515, 72.83544517289523", // garage cordinates
      destinations,
    });
  }

  if (trip_type !== tripTypes.ROUND_TRIP) {
    whereQuery.duration_hours = duration_hours;
    whereQuery.included_km = included_km;
  }
  const carPricing = await CarsPricings.findOne({
    where: whereQuery,
  });

  if (!carPricing) throw new ErrorHandler(404, "Pricing information not found for the specified duration and trip type");

  const carPricesJson = carPricing.get({ plain: true });
  const carPrices = roundTripPriceCalculate(trip_type, drop_datetime, pickup_datetime, carPricesJson, distanceData);
  const extraJson = addOn ? addOn : [];
  const discountJson = discounts ? discounts : [];
  console.log();

  const addOnIds = extraJson.map((e) => {
    return e.id;
  });
  const discountIds = discountJson.map((e) => {
    return e.id;
  });
  const estimated_price = {
    ...carPrices,
    addOn: [],
    discounts: [],
    total_price: carPrices.base_price,
  };

  if (discountIds.length > 0) {
    const fetchDiscounts = await Discounts.findAll({
      attributes: ["id", "code", "value", "type", "expiry_date"],
      where: { id: { [Op.in]: discountIds } },
      raw: true,
    });
    if (fetchDiscounts) {
      estimated_price.discounts = [...fetchDiscounts];
      fetchDiscounts.forEach((el) => {
        estimated_price.total_price = calculateDiscount(estimated_price.total_price, el.type, el.value);
      });
    }
  }
  if (addOnIds.length > 0) {
    const fetchAddOns = await AddOns.findAll({
      attributes: ["id", "price", "type", "duration"],
      where: { id: { [Op.in]: addOnIds } },
      raw: true,
    });

    if (fetchAddOns) {
      estimated_price.addOn = [...fetchAddOns];
      fetchAddOns.forEach((element) => {
        estimated_price.total_price += typeof element.price === "string" ? Number(element.price) : element.price;
      });
    }
  }
  return estimated_price;
};
const calculateDiscount = (total_price, discountType, discountValue) => {
  const price = Number(total_price) || 0;
  const value = Number(discountValue) || 0;
  if (price <= 0 || value <= 0) {
    return price;
  }
  let finalPrice = price;
  if (discountType === "PERCENTAGE") {
    const discountAmount = (price * value) / 100;
    finalPrice = price - discountAmount;
  } else if (discountType === "FLAT") {
    finalPrice = price - value;
  }
  // Prevent negative price
  return Math.max(0, Math.round(finalPrice));
};

module.exports = { isCarAvailable, calculatePricingLogic };
