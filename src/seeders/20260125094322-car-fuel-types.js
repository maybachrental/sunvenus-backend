"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("fuel_types", [{ fuel: "PETROl" }, { fuel: "DIESEL" }, { fuel: "ELECTRIC" }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("fuel_types", null, {});
  },
};
