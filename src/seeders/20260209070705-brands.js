"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "brands",
      [
        {
          brand_name: "bmw",
          brand_img: "bmw.png",
        },
        {
          brand_name: "bentley",
          brand_img: "bentley.png",
        },
        {
          brand_name: "audi",
          brand_img: "audi.png",
        },
        {
          brand_name: "maybach",
          brand_img: "maybach.png",
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("brands", null, {});
  },
};
