'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("blog_tags", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      blog_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "blogs",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      tag_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "tags",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addIndex("blog_tags", ["blog_id"], {
      name: "blog_tags_blog_id_index",
    });

    // Index for tag filtering
    await queryInterface.addIndex("blog_tags", ["tag_id"], {
      name: "blog_tags_tag_id_index",
    });

    // Prevent duplicate relationships
    await queryInterface.addIndex("blog_tags", ["blog_id", "tag_id"], {
      unique: true,
      name: "blog_tags_blog_id_tag_id_unique",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('blog_tags');
  }
};