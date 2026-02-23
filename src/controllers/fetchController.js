const axios = require("axios");
const ErrorHandler = require("../utils/ErrorHandler");
const { validErrorName } = require("../utils/staticExport");

const fetchDistanceMatrix = async (req, res, next) => {
  try {
    const { origin, destinations, mode = "driving", units = "metric" } = req.body;

    if (!origin || !destinations || !Array.isArray(destinations) || destinations.length === 0) {
      throw new ErrorHandler(400, "Origin and destinations array are required", validErrorName.INVALID_REQUEST);
    }

    // Convert destinations array into pipe-separated string
    const formattedDestinations = destinations.join("|");

    const response = await axios.get(process.env.GOOGLE_DISTANCE_MATRIX_URL, {
      params: {
        origins: origin,
        destinations: formattedDestinations,
        mode,
        units,
        departure_time: "now", // Enables traffic-aware durations
        key: process.env.GOOGLE_API_KEY,
      },
      timeout: 5000,
    });

    if (response.data.status !== "OK") {
      throw new Error(response.data.error_message || "Google API error");
    }

    const elements = response.data.rows[0].elements;

    const results = elements.map((element, index) => {
      if (element.status !== "OK") {
        return {
          destination: destinations[index],
          error: element.status,
        };
      }

      return {
        destination: destinations[index],
        distanceText: element.distance.text,
        distanceMeters: element.distance.value,
        durationText: element.duration.text,
        durationSeconds: element.duration.value,
        durationInTrafficText: element.duration_in_traffic?.text || null,
        durationInTrafficSeconds: element.duration_in_traffic?.value || null,
      };
    });

    return res.status(200).json({
      success: true,
      origin,
      results,
    });
  } catch (error) {
    console.error("Distance Matrix Error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch distance data",
      error: error.response?.data || error.message,
    });
  }
};

module.exports = { fetchDistanceMatrix };
