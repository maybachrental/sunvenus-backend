"use strict";
const { Model } = require("sequelize");
const CloudinaryService = require("../services/external/cloudinary.service");
const { extractPublicId } = require("../utils/helper");
module.exports = (sequelize, DataTypes) => {
  class Blogs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.BlogSections, {
        foreignKey: "blog_id",
        as: "sections",
        onDelete: "CASCADE",
        hooks: true,
      });
      this.hasMany(models.BlogFeatures, {
        foreignKey: "blog_id",
        as: "features",
        onDelete: "CASCADE",
        hooks: true,
      });
    }
    static initHooks(models) {
      this.addHook("afterDestroy", async (blog, options) => {
        if (blog.hero_image) {
          const oldPublicId = extractPublicId(blog.hero_image); // implement per your util
          if (oldPublicId) {
            await CloudinaryService.delete(oldPublicId);
          }
        }

        if (blog.author_image) {
          const oldPublicId = extractPublicId(blog.author_image); // implement per your util
          if (oldPublicId) {
            await CloudinaryService.delete(oldPublicId);
          }
        }
      });
    }
  }
  Blogs.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      hero_image: {
        type: DataTypes.STRING,
      },
      author_name: DataTypes.STRING,
      author_image: DataTypes.STRING,

      meta_title: DataTypes.STRING,
      meta_description: DataTypes.TEXT,
      meta_keywords: DataTypes.TEXT,

      status: {
        type: DataTypes.ENUM("draft", "published"),
        defaultValue: "draft",
      },
      published_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Blogs",
      tableName: "blogs",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["slug"],
          name: "blogs_slug_unique",
        },
        {
          fields: ["status"],
          name: "blogs_status_index",
        },
        {
          fields: ["published_at"],
          name: "blogs_published_at_index",
        },
        {
          fields: ["created_at"],
          name: "blogs_created_at_index",
        },
      ],
    },
  );
  return Blogs;
};
