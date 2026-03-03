"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BlogTags extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  BlogTags.init(
    {
      title: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "BlogTags",
      tableName: "blog_tags",
      underscored: "true",
      timestamps: true,
      indexes: [
        {
          fields: ["blog_id"],
          name: "blog_tags_blog_id_index",
        },
        {
          fields: ["tag_id"],
          name: "blog_tags_tag_id_index",
        },
        {
          unique: true,
          fields: ["blog_id", "tag_id"],
          name: "blog_tags_blog_id_tag_id_unique",
        },
      ],
    },
  );
  return BlogTags;
};
