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
      "discounts",
      [
        {
          code: "SVOFF20",
          type: "PERCENTAGE",
          value: 20,
          expiry_date: null,
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("discounts", null, {});
  },
};
