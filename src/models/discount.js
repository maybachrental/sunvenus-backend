"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Discount extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Discount.init(
    {
      code: DataTypes.STRING,
      type: DataTypes.ENUM("PERCENTAGE", "FLAT"),
      value: DataTypes.INTEGER,
      expiry_date: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Discount",
      tableName: "discounts",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );
  return Discount;
};
