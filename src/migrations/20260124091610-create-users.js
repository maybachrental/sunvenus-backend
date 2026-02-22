"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      role: {
        type: Sequelize.ENUM("USER", "ADMIN"),
        allowNull: false,
        defaultValue: "USER",
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      password: {
        type: Sequelize.TEXT,
        allowNull: true, // NULL for Google OAuth users
      },

      profile_image: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      auth_provider: {
        type: Sequelize.ENUM("LOCAL", "GOOGLE"),
        allowNull: false,
        defaultValue: "LOCAL",
      },

      is_email_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      is_phone_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      status: {
        type: Sequelize.ENUM("ACTIVE", "BLOCKED"),
        allowNull: false,
        defaultValue: "ACTIVE",
      },

      google_sub_id: {
        type: Sequelize.STRING,
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
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
    await queryInterface.addIndex("users", ["email"], {
      unique: true,
      name: "email_index",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("users", "email_index");
    await queryInterface.dropTable("users");
  },
};
