'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("blog_features", {
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
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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
    // Index for foreign key
    await queryInterface.addIndex("blog_features", ["blog_id"], {
      name: "blog_features_blog_id_index",
    });

    // Composite index for ordered fetching
    await queryInterface.addIndex("blog_features", ["blog_id", "sort_order"], {
      name: "blog_features_blog_id_sort_order_index",
    });

    // Optional (admin sorting)
    await queryInterface.addIndex("blog_features", ["created_at"], {
      name: "blog_features_created_at_index",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('blog_features');
  }
};