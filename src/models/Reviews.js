"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Reviews extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Reviews.init(
    {
      // --- Relationships ---
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },

      car_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // --- Core Review Fields ---
      rating: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
          isInt: true,
        },
        comment: "Rating from 1 (worst) to 5 (best)",
      },

      title: {
        type: DataTypes.STRING(150),
        allowNull: true,
        validate: {
          len: [0, 150],
        },
        comment: "Short summary headline of the review",
      },

      body: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [10, 5000],
        },
        comment: "Full review content written by the user",
      },

      // --- Reviewer Info ---
      reviewer_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Display name, useful if anonymous reviews are allowed",
      },

      // --- Media ---
      media_urls: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: "Array of image/video URLs attached to the review",
      },

      // --- Status & Moderation ---
      status: {
        type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
        allowNull: false,
        defaultValue: "PENDING",
        comment: "Moderation status of the review",
      },

      is_verified_rented: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "True if reviewer has a confirmed rental of this car",
      },

      // --- Engagement ---
      helpful_votes: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
        comment: "Number of users who found this review helpful",
      },

      reported_count: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: "Number of times this review has been flagged/reported",
      },

      // --- Source ---
      source: {
        type: DataTypes.ENUM("web", "mobile", "api"),
        allowNull: false,
        defaultValue: "web",
        comment: "Platform from which the review was submitted",
      },
    },
    {
      sequelize,
      modelName: "Reviews",
      tableName: "reviews",
      underscored: true, 
      paranoid: false, 
      timestamps: true,
      indexes: [
        {
          fields: ["status"],
          name: "idx_reviews_status",
        },
        {
          fields: ["rating"],
          name: "idx_reviews_rating",
        },
      ],
    },
  );
  return Reviews;
};
