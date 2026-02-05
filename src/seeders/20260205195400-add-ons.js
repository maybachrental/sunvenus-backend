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
      "add_ons",
      [
        {
          type: "Flower Decoration",
          price: 2000,
          // duration: null,
        },
        {
          type: "Bouncer/Bodyguard",
          price: 4000,
          duration: 8,
        },
        {
          type: "Armed Security Gun Man",
          price: 8000,
          duration: 8,
        },
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
    await queryInterface.bulkDelete("add_ons", null, {});
  },
};
