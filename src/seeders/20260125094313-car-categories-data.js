"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     */
    await queryInterface.bulkInsert(
      "car_categories",

      [
        { category: "Hatchback" },
        { category: "Luxury Sedan" },
        { category: "Luxury SUV" },
        { category: "Compact SUV" },
        { category: "Convertible" },
        { category: "Limousine" },
        { category: "Luxury Minivan" },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     */
    await queryInterface.bulkDelete("car_categories", null, {});
  },
};
