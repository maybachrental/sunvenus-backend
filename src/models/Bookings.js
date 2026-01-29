"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Bookings extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Bookings.init(
    {
      booking_code: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
      },

      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },

      car_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      discount_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      booking_type: {
        type: DataTypes.ENUM("LOCAL", "OUTSTATION", "AIRPORT", "OTHER"),
      },

      pickup_location: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      drop_location: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      pickup_datetime: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      drop_datetime: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      booking_hours: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      included_km: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      base_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      extra_hour_price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },

      extra_km_price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },

      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      payment_status: {
        type: DataTypes.ENUM("PENDING", "PAID", "FAILED", "REFUNDED", "UNPAID"),
        defaultValue: "PENDING",
      },

      booking_status: {
        type: DataTypes.ENUM("PENDING_PAYMENT", "CONFIRMED", "ONGOING", "COMPLETED", "CANCELLED"),
        defaultValue: "PENDING_PAYMENT",
      },
    },
    {
      sequelize,
      modelName: "Bookings",
      tableName: "bookings",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      paranoid: true,
      indexes: [
        {
          name: "idx_car_datetime",
          fields: ["car_id", "pickup_datetime", "drop_datetime"],
        },
        {
          name: "idx_booking_status",
          fields: ["booking_status"],
        },
      ],
    },
  );
  return Bookings;
};
