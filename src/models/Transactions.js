"use strict";
const { Model } = require("sequelize");
const { generatePrefixedId } = require("../utils/generators");
module.exports = (sequelize, DataTypes) => {
  class Transactions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Transactions.init(
    {
      req_json: {
        type: DataTypes.JSON,
      },
      res_json: {
        type: DataTypes.JSON,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      booking_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      currency: DataTypes.STRING,
      transaction_id: DataTypes.STRING(20),
      invoice_id: DataTypes.STRING,
      amount: DataTypes.INTEGER,
      payment_method: DataTypes.STRING,
      stripe_session_id: DataTypes.STRING(255),
      status: {
        type: DataTypes.STRING,
      },
      payment_status: {
        type: DataTypes.ENUM("SUCCESS", "FAILED", "PENDING", "REFUNDED", "EXPIRED"),
        defaultValue: "PENDING",
      },
    },
    {
      sequelize,
      modelName: "Transactions",
      tableName: "transactions",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: true,
      deletedAt: "deleted_at",
      indexes: [
        { fields: ["user_id"] },
        { fields: ["booking_id"] },
        { unique: true, fields: ["transaction_id"] },
        { fields: ["invoice_id"] },
        { fields: ["stripe_session_id"] },
        { fields: ["payment_status"] },
        { fields: ["created_at"] },
        { fields: ["deleted_at"] },
        { fields: ["user_id", "created_at"] },
      ],
    },
  );
  Transactions.beforeCreate(async (transaction, options) => {
    transaction.transaction_id = generatePrefixedId("TX");
  });
  return Transactions;
};
