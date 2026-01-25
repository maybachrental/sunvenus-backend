"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Users.init(
    {
      role: {
        type: DataTypes.ENUM("USER", "ADMIN"),
        defaultValue: "USER",
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },

      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      password: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      profile_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      auth_provider: {
        type: DataTypes.ENUM("LOCAL", "GOOGLE"),
        defaultValue: "LOCAL",
      },

      is_email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      is_phone_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      status: {
        type: DataTypes.ENUM("ACTIVE", "BLOCKED"),
        defaultValue: "ACTIVE",
      },
    },
    {
      sequelize,
      modelName: "Users",
      tableName: "users",
      timestamps: true,
      underscored: true,
      paranoid: true,
      defaultScope: {
        attributes: { exclude: ["password"] },
      },
      indexes: [{ unique: true, fields: ["email"] }],
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );
  return Users;
};
