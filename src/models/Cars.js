"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Cars extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.CarsPricings, {
        foreignKey: "car_id",
      });
      this.belongsTo(models.CarCategories, {
        foreignKey: "category_id",
      });
      this.belongsTo(models.FuelTypes, {
        foreignKey: "fuel_type_id",
      });
    }
  }
  Cars.init(
    {
      name: DataTypes.STRING,
      brand_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      model: DataTypes.STRING,
      color: DataTypes.STRING,
      seating_capacity: DataTypes.INTEGER,
      category_id: {
        type: DataTypes.INTEGER,
      },
      transmission: DataTypes.ENUM("MANUAL", "AUTOMATIC"),
      fuel_type_id: DataTypes.INTEGER,
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Cars",
      tableName: "cars",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );
  return Cars;
};
