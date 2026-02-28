"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("car_images", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      car_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "cars",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        allowNull: false,
      },
      image_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      image_path: {
        type: Sequelize.TEXT,
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      with_bg: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      public_id: {
        type: Sequelize.TEXT,
      },
      file_type: {
        type: Sequelize.ENUM("IMAGE", "VIDEO"),
        defaultValue: "IMAGE",
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
    await queryInterface.dropTable("car_images");
  },
};
