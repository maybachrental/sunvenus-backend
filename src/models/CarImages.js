"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CarImages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Cars, {
        foreignKey: "car_id",
        onDelete: "CASCADE",
      });
    }
  }
  CarImages.init(
    {
      car_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      image_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image_path: {
        type: DataTypes.TEXT,
      },
      is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      with_bg: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      public_id: {
        type: DataTypes.TEXT,
      },
      file_type: {
        type: DataTypes.ENUM("IMAGE", "VIDEO"),
        defaultValue: "IMAGE",
      },
      image_url: {
        type: DataTypes.VIRTUAL,
        get() {
          const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
          const publicId = this.getDataValue("public_id");
          const imageExt = this.getDataValue("image_name");
          const ext = imageExt.split(".")[1];
          if (!cloudName || !publicId) return null;
          return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}.${ext}`;
        },
      },
    },
    {
      sequelize,
      modelName: "CarImages",
      tableName: "car_images",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );
  return CarImages;
};
