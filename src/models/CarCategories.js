"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CarCategories extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Cars, {
        foreignKey: "category_id",
      });
    }
  }
  CarCategories.init(
    {
      category: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "CarCategories",
      tableName: "car_categories",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );
  return CarCategories;
};
