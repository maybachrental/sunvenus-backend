"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BlogSections extends Model {
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
    static initHooks(models) {
      this.addHook("afterDestroy", async (blog, options) => {
        if (blog.section_type === "IMAGE" && blog.image_public_id) {
          await CloudinaryService.delete(blog.image_public_id);
        }
      });
    }
  }
  BlogSections.init(
    {
      blog_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      section_type: {
        type: DataTypes.ENUM("TEXT", "IMAGE"),
        allowNull: false,
      },
      content: DataTypes.TEXT("long"),
      image_url: DataTypes.STRING,
      image_public_id: DataTypes.STRING,
      sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "BlogSections",
      tableName: "blog_sections",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["blog_id"],
          name: "blog_sections_blog_id_index",
        },
        {
          fields: ["blog_id", "sort_order"],
          name: "blog_sections_blog_id_sort_order_index",
        },
        {
          fields: ["section_type"],
          name: "blog_sections_section_type_index",
        },
        {
          fields: ["created_at"],
          name: "blog_sections_created_at_index",
        },
      ],
    },
  );
  return BlogSections;
};
