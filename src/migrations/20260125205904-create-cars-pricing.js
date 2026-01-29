'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("cars_pricings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      car_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "cars",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      base_price: {
        type: Sequelize.INTEGER,
      },
      duration_hours: {
        type: Sequelize.INTEGER,
      },
      included_km: {
        type: Sequelize.INTEGER,
      },
      extra_hour_charge: {
        type: Sequelize.INTEGER,
      },
      extra_km_charge: {
        type: Sequelize.INTEGER,
      },
      is_outstation: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('cars_pricings');
  }
};