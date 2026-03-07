"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("reviews", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      // --- Relationships ---
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      car_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "cars",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      // --- Core Review Fields ---
      rating: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: false,
        comment: "Rating from 1 (worst) to 5 (best)",
      },

      title: {
        type: Sequelize.STRING(150),
        allowNull: true,
        comment: "Short summary headline of the review",
      },

      body: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: "Full review content written by the user",
      },

      // --- Reviewer Info ---
      reviewer_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: "Display name, useful if anonymous reviews are allowed",
      },

      // --- Media ---
      media_urls: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
        comment: "Array of image/video URLs attached to the review",
      },

      // --- Status & Moderation ---
      status: {
        type: Sequelize.ENUM("PENDING", "APPROVED", "REJECTED"),
        allowNull: false,
        defaultValue: "PENDING",
        comment: "Moderation status of the review",
      },

      is_verified_rented: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "True if reviewer has a confirmed purchase of this product",
      },

      // --- Engagement ---
      helpful_votes: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: "Number of users who found this review helpful",
      },

      reported_count: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: "Number of times this review has been flagged/reported",
      },

      // --- Source ---
      source: {
        type: Sequelize.ENUM("web", "mobile", "api"),
        allowNull: false,
        defaultValue: "web",
        comment: "Platform from which the review was submitted",
      },

      // --- Timestamps ---
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // --- Indexes ---
    await queryInterface.addIndex("reviews", ["status"], {
      name: "idx_reviews_status",
    });

    await queryInterface.addIndex("reviews", ["rating"], {
      name: "idx_reviews_rating",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("reviews");
  },
};
