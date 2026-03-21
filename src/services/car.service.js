const ErrorHandler = require("../utils/ErrorHandler");
const { tripTypes } = require("../utils/staticExport");

const triptypeCondition = (tripType, pickup_datetime, duration_hours = 8, drop_datetime = null) => {
  if (!(pickup_datetime instanceof Date) || isNaN(pickup_datetime)) {
    throw new Error("Invalid pickup date");
  }

  switch (tripType) {
    case tripTypes.LOCAL:
      return new Date(pickup_datetime.getTime() + duration_hours * 60 * 60 * 1000);

    case tripTypes.AIRPORT:
      // If airport is fixed duration (example: 4 hours default)
      const airportDuration = duration_hours || 8;
      return new Date(pickup_datetime.getTime() + airportDuration * 60 * 60 * 1000);

    case tripTypes.ROUND_TRIP:
      // For outstation, drop_datetime should be provided explicitly
      if (!drop_datetime) {
        throw new Error("Drop date/time required for ROUND_TRIP trip");
      }
      return new Date(drop_datetime);

    default:
      throw new Error("Invalid trip type");
  }
};

const roundTripPriceCalculate = (trip_type, drop_datetime, pickup_datetime, carsPricingData, distanceData) => {
  try {
    if (!carsPricingData) {
      throw new ErrorHandler(400, "Cars pricing data is required");
    }

    if (trip_type === tripTypes.ROUND_TRIP && (!distanceData || !pickup_datetime || !drop_datetime)) {
      throw new ErrorHandler(400, "Pickup, drop datetime and distance are required for round trip");
    }

    // Normalize to array
    const isArray = Array.isArray(carsPricingData);
    const pricingArray = isArray ? carsPricingData : [carsPricingData];

    const updatedPricing = pricingArray.map((e) => {
      let basePrice = e.base_price;

      if (trip_type === tripTypes.ROUND_TRIP) {
        const { totalHours, totalKms } = getTotalKmsAndHourRoundTrip(pickup_datetime, drop_datetime, distanceData?.[0]?.distanceMeters);
        basePrice = Math.max(Number(e.extra_hour_charge || 0) * totalHours, Number(e.extra_km_charge || 0) * totalKms);
      }

      return {
        ...e,
        base_price: Number(basePrice.toFixed(2)),
      };
    });

    return isArray ? updatedPricing : updatedPricing[0];
  } catch (error) {
    throw error;
  }
};

const getTotalKmsAndHourRoundTrip = (pickup_datetime, drop_datetime, distanceMeters) => {
  // Convert to Date objects
  const pickup = new Date(pickup_datetime);
  const drop = new Date(drop_datetime);

  // Calculate difference in milliseconds
  const diffMs = drop - pickup;

  // Convert milliseconds → hours
  const totalHours = diffMs / (1000 * 60 * 60);

  // Convert meters → kilometers
  const totalKms = distanceMeters / 1000;

  return {
    totalHours,
    totalKms,
  };
};
module.exports = { triptypeCondition, roundTripPriceCalculate };
