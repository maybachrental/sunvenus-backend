"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BlogFeatures extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Blogs, {
        foreignKey: "blog_id",
        as: "blogs",
        onDelete: "CASCADE",
      });
    }
  }
  BlogFeatures.init(
    {
      blog_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "BlogFeatures",
      tableName: "blog_features",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["blog_id"],
          name: "blog_features_blog_id_index",
        },
        {
          fields: ["blog_id", "sort_order"],
          name: "blog_features_blog_id_sort_order_index",
        },
        {
          fields: ["created_at"],
          name: "blog_features_created_at_index",
        },
      ],
    },
  );
  return BlogFeatures;
};
