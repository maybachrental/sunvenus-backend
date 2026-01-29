'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FuelTypes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Cars, {
        foreignKey: "fuel_type_id",
      });
    }
  }
  FuelTypes.init(
    {
      fuel: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "FuelTypes",
      tableName: "fuel_types",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );
  return FuelTypes;
};