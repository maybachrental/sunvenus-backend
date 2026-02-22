"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Fetch all cars
    const cars = await queryInterface.sequelize.query(`SELECT id, name FROM cars;`, { type: Sequelize.QueryTypes.SELECT });

    const packages = [];

    const durations = [
      { hours: 8, km: 80, outstation: false },
      { hours: 12, km: 120, outstation: false },
      { hours: 24, km: 80, outstation: false },
      { hours: 24, km: 120, outstation: false },
      { hours: 12, km: 250, outstation: true },
    ];

    cars.forEach((car) => {
      let pricingConfig;

      // GROUP 1 (₹1000 logic)
      if (
        car.name.includes("BMW M5") ||
        car.name.includes("MERC E CLASS") ||
        (car.name.includes("AUDI A8L") && car.name.includes("BLACK")) ||
        (car.name.includes("AUDI Q7 SUV VIP") && car.name.includes("RED"))
      ) {
        pricingConfig = {
          prices: [10000, 18000, 20000, 24000, 25000],
          extraHour: 1000,
          extraKm: 100,
        };
      }

      // GROUP 2 (₹2000 logic)
      else if (
        car.name.includes("MAYBACH S500 KIT") ||
        car.name.includes("740D KIT") ||
        (car.name.includes("AUDI A8L") && car.name.includes("WHITE")) ||
        (car.name.includes("AUDI Q7 SUV VIP") && car.name.includes("WHITE")) ||
        (car.name.includes("RANGE ROVER VOGUE") && car.name.includes("BLACK"))
      ) {
        pricingConfig = {
          prices: [20000, 36000, 40000, 48000, 50000],
          extraHour: 2000,
          extraKm: 200,
        };
      }

      // GROUP 3 (₹2500 logic)
      else if (
        car.name.includes("AMG E63") ||
        car.name.includes("GLS600") ||
        car.name.includes("MAYBACH ORIGINAL S500") ||
        (car.name.includes("RANGE ROVER VOGUE") && car.name.includes("WHITE"))
      ) {
        pricingConfig = {
          prices: [25000, 45000, 50000, 60000, 62500],
          extraHour: 2500,
          extraKm: 250,
        };
      }

      // GROUP 4 (₹4000 logic)
      else if (car.name.includes("BENTLEY") || car.name.includes("V600 LIMOUSINE")) {
        pricingConfig = {
          prices: [40000, 72000, 80000, 96000, 100000],
          extraHour: 4000,
          extraKm: 400,
        };
      }

      // GROUP 5 (Toyota Vellfire Special)
      else if (car.name.includes("VELLFIRE")) {
        pricingConfig = {
          prices: [50000, 90000, 100000, 120000, 125000],
          extraHour: [5000, 4000, 4000, 4000, 4000],
          extraKm: [500, 400, 400, 400, 400],
        };
      }

      if (!pricingConfig) return;

      durations.forEach((pkg, index) => {
        packages.push({
          car_id: car.id,
          base_price: pricingConfig.prices[index],
          duration_hours: pkg.hours,
          included_km: pkg.km,
          extra_hour_charge: Array.isArray(pricingConfig.extraHour) ? pricingConfig.extraHour[index] : pricingConfig.extraHour,
          extra_km_charge: Array.isArray(pricingConfig.extraKm) ? pricingConfig.extraKm[index] : pricingConfig.extraKm,
          is_outstation: pkg.outstation,
        });
      });
    });

    await queryInterface.bulkInsert("cars_pricings", packages);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("cars_pricings", null, {});
  },
};
