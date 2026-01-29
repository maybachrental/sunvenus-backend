"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const packages = [];
    const priceGroups = [
      { cars: [1, 2, 3, 4, 5, 6], base: 1000 },
      { cars: [7, 8, 9, 10, 11], base: 2000 },
      { cars: [12, 13, 14, 15], base: 2500 },
      { cars: [16, 17], base: 4000 },
    ];

    priceGroups.forEach((group) => {
      group.cars.forEach((carId) => {
        packages.push(
          { car_id: carId, base_price: group.base * 10, duration_hours: 8, included_km: 80, extra_hour_charge: group.base, extra_km_charge: group.base / 10, is_outstation: false },
          { car_id: carId, base_price: group.base * 18, duration_hours: 12, included_km: 120, extra_hour_charge: group.base, extra_km_charge: group.base / 10, is_outstation: false },
          { car_id: carId, base_price: group.base * 20, duration_hours: 24, included_km: 80, extra_hour_charge: group.base, extra_km_charge: group.base / 10, is_outstation: false },
          { car_id: carId, base_price: group.base * 24, duration_hours: 24, included_km: 120, extra_hour_charge: group.base, extra_km_charge: group.base / 10, is_outstation: false },
          { car_id: carId, base_price: group.base * 25, duration_hours: 12, included_km: 250, extra_hour_charge: group.base, extra_km_charge: group.base / 10, is_outstation: true },
        );
      });
    });

    await queryInterface.bulkInsert("cars_pricings", packages);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("cars_pricings", null, {});
  },
};
