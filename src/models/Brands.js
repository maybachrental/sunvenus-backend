"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Brands extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Brands.init(
    {
      brand_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      brand_img: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "Brands",
      tableName: "brands",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );
  return Brands;
};
