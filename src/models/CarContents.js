"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CarContents extends Model {
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
  CarContents.init(
    {
      car_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      content: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
    },
    {
      sequelize,
      modelName: "CarContents",
      tableName: "car_contents",
      underscored: true,
      timestamps: true,
      // createdAt: "created_at",
      // updatedAt: "updated_at",
    },
  );
  return CarContents;
};
