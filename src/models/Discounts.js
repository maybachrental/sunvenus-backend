"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Discounts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    // Optional helper method
    isExpired() {
      if (!this.expiry_date) return false;
      return new Date(this.expiry_date) < new Date();
    }
  }
  Discounts.init(
    {
      code: DataTypes.STRING,
      type: DataTypes.ENUM("PERCENTAGE", "FLAT"),
      value: DataTypes.INTEGER,
      expiry_date: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Discounts",
      tableName: "discounts",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      // ✅ AUTO FILTER
      defaultScope: {
        where: {
          [Op.or]: [{ expiry_date: null }, { expiry_date: { [Op.gt]: new Date() } }],
        },
      },
    },
  );
  return Discounts;
};
