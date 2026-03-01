"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("bookings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      booking_code: {
        type: Sequelize.STRING(30),
        allowNull: true,
        unique: true,
      },

      user_id: {
        type: Sequelize.BIGINT,
        references: {
          model: "users",
          key: "id",
        },
        allowNull: false,
        onDelete: "CASCADE",
      },

      car_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "cars",
          key: "id",
        },
        allowNull: false,
      },
      discount_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "discounts",
          key: "id",
        },
        allowNull: true,
      },

      trip_type: {
        type: Sequelize.ENUM("LOCAL", "ROUND_TRIP", "AIRPORT", "OTHER"),
      },

      pickup_location: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      drop_location: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      pickup_datetime: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      drop_datetime: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      booking_hours: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      included_km: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      base_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      extra_hour_price: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },

      extra_km_price: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },

      total_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      payment_status: {
        type: Sequelize.ENUM("PENDING", "PAID", "FAILED", "REFUNDED", "UNPAID"),
        defaultValue: "PENDING",
      },

      booking_status: {
        type: Sequelize.ENUM("PENDING_PAYMENT", "CONFIRMED", "ONGOING", "COMPLETED", "CANCELLED"),
        defaultValue: "PENDING_PAYMENT",
      },
      booking_type: {
        type: Sequelize.ENUM("PAY_NOW", "PAY_LATER"),
        allowNull: false,
      },
      stripe_session_id: {
        type: Sequelize.STRING,
      },
      checkout_url: Sequelize.TEXT,
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
    // Indexes
    await queryInterface.addIndex("bookings", ["car_id", "pickup_datetime", "drop_datetime"], {
      name: "idx_car_datetime",
    });

    await queryInterface.addIndex("bookings", ["booking_status"], {
      name: "idx_booking_status",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("bookings");
  },
};
