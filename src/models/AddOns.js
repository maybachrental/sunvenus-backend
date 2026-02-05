"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AddOns extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AddOns.init(
    {
      type: DataTypes.STRING,
      price: DataTypes.DECIMAL,
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      extra: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "AddOns",
      tableName: "add_ons",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );
  return AddOns;
};
