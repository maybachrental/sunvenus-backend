"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const cars = await queryInterface.sequelize.query(`SELECT id, name FROM cars ORDER BY id ASC;`, { type: Sequelize.QueryTypes.SELECT });

    const durations = [
      { hours: 8, km: 80, outstation: false },
      { hours: 12, km: 120, outstation: false },
      { hours: 24, km: 80, outstation: false },
      { hours: 24, km: 120, outstation: false },
      { hours: 12, km: 250, outstation: true },
    ];

    const pricingGroups = {
      group1: {
        prices: [10000, 18000, 20000, 24000, 25000],
        extraHour: 1000,
        extraKm: 100,
      },
      group2: {
        prices: [20000, 36000, 40000, 48000, 50000],
        extraHour: 2000,
        extraKm: 200,
      },
      group3: {
        prices: [25000, 45000, 50000, 60000, 62500],
        extraHour: 2500,
        extraKm: 250,
      },
      group4: {
        prices: [40000, 72000, 80000, 96000, 100000],
        extraHour: 4000,
        extraKm: 400,
      },
      group5: {
        prices: [50000, 90000, 100000, 120000, 125000],
        extraHour: [5000, 4000, 4000, 4000, 4000],
        extraKm: [500, 400, 400, 400, 400],
      },
    };

    const packages = [];

    cars.forEach((car) => {
      const name = car.name.toUpperCase().trim();
      let config = null;

      // GROUP 4
      if (name.includes("BENTLEY") || name.includes("V600 LIMOUSINE")) {
        config = pricingGroups.group4;
      }

      // GROUP 5
      else if (name.includes("VELLFIRE")) {
        config = pricingGroups.group5;
      }

      // GROUP 3
      else if (name.includes("AMG E63") || name.includes("GLS600") || name.includes("ORIGINAL S500") || name.includes("RANGE ROVER VOGUE")) {
        config = pricingGroups.group3;
      }

      // GROUP 2
      else if (name.includes("MAYBACH S500 KIT") || name.includes("740D KIT") || name.includes("AUDI A8L") || name.includes("AUDI Q7 SUV VIP")) {
        config = pricingGroups.group2;
      }

      // GROUP 1
      else if (name.includes("BMW M5") || name.includes("MERC E CLASS")) {
        config = pricingGroups.group1;
      }

      if (!config) {
        console.log("❌ Missing pricing for:", car.name);
        return;
      }

      durations.forEach((pkg, index) => {
        packages.push({
          car_id: car.id,
          base_price: config.prices[index],
          duration_hours: pkg.hours,
          included_km: pkg.km,
          extra_hour_charge: Array.isArray(config.extraHour) ? config.extraHour[index] : config.extraHour,
          extra_km_charge: Array.isArray(config.extraKm) ? config.extraKm[index] : config.extraKm,
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
