"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CarsPricings extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Cars, {
        foreignKey: "car_id",
      });
    }
  }
  CarsPricings.init(
    {
      car_id: DataTypes.INTEGER,
      base_price: DataTypes.INTEGER,
      duration_hours: DataTypes.INTEGER,
      included_km: DataTypes.INTEGER,
      extra_hour_charge: DataTypes.INTEGER,
      extra_km_charge: DataTypes.INTEGER,
      is_outstation: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "CarsPricings",
      tableName: "cars_pricings",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );
  return CarsPricings;
};
