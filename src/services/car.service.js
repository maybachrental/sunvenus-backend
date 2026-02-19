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
  

// new Date("2026-02-14T10:00").toISOString(); front should send like this

module.exports = { triptypeCondition };
