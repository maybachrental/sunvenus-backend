"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserOtps extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserOtps.init(
    {
      otp: {
        type: DataTypes.STRING,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      is_used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      type: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "UserOtps",
      tableName: "user_otps",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );
  return UserOtps;
};
