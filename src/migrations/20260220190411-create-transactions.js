"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("transactions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      req_json: {
        type: Sequelize.JSON,
      },
      res_json: {
        type: Sequelize.JSON,
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      booking_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "bookings",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      currency: Sequelize.STRING,
      transaction_id: Sequelize.STRING(20),
      invoice_id: Sequelize.STRING,
      amount: Sequelize.INTEGER,
      payment_method: Sequelize.STRING,
      stripe_session_id: Sequelize.STRING(255),
      status: {
        type: Sequelize.STRING,
      },
      payment_status: {
        type: Sequelize.ENUM("SUCCESS", "FAILED", "PENDING", "REFUNDED", "EXPIRED"),
        defaultValue: "PENDING",
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
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
    // INDEXES
    await queryInterface.addIndex("transactions", ["user_id"]);
    await queryInterface.addIndex("transactions", ["booking_id"]);
    await queryInterface.addIndex("transactions", ["transaction_id"], {
      unique: true,
    });
    await queryInterface.addIndex("transactions", ["invoice_id"]);
    await queryInterface.addIndex("transactions", ["stripe_session_id"]);
    await queryInterface.addIndex("transactions", ["payment_status"]);
    await queryInterface.addIndex("transactions", ["created_at"]);

    // Composite index (very useful for dashboards)
    await queryInterface.addIndex("transactions", ["user_id", "created_at"]);
    await queryInterface.addIndex("transactions", ["deleted_at"]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("transactions");
  },
};
