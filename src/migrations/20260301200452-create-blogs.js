"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("blogs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      hero_image: {
        type: Sequelize.STRING,
      },
      author_name: Sequelize.STRING,
      author_image: Sequelize.STRING,

      meta_title: Sequelize.STRING,
      meta_description: Sequelize.TEXT,
      meta_keywords: Sequelize.TEXT,

      status: {
        type: Sequelize.ENUM("draft", "published"),
        defaultValue: "draft",
      },
      published_at: Sequelize.DATE,
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
    // Add Indexes
    await queryInterface.addIndex("blogs", ["slug"], {
      unique: true,
      name: "blogs_slug_unique",
    });

    await queryInterface.addIndex("blogs", ["status"], {
      name: "blogs_status_index",
    });

    await queryInterface.addIndex("blogs", ["published_at"], {
      name: "blogs_published_at_index",
    });

    await queryInterface.addIndex("blogs", ["created_at"], {
      name: "blogs_created_at_index",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("blogs");
  },
};
