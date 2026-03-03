"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("blog_sections", {
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
      section_type: {
        type: Sequelize.ENUM("TEXT", "IMAGE"),
        allowNull: false,
      },
      content: Sequelize.TEXT("long"),
      image_url: Sequelize.STRING,
      image_public_id: Sequelize.STRING,
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
    // Foreign key index
    await queryInterface.addIndex("blog_sections", ["blog_id"], {
      name: "blog_sections_blog_id_index",
    });

    //  Composite index for fast ordered fetch
    await queryInterface.addIndex("blog_sections", ["blog_id", "sort_order"], {
      name: "blog_sections_blog_id_sort_order_index",
    });

    //  Section type filter index
    await queryInterface.addIndex("blog_sections", ["section_type"], {
      name: "blog_sections_section_type_index",
    });

    //  Admin sorting
    await queryInterface.addIndex("blog_sections", ["created_at"], {
      name: "blog_sections_created_at_index",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("blog_sections");
  },
};
