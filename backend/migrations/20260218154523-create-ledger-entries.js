"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("LedgerEntries", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      pickup_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      entry_type: {
        type: Sequelize.ENUM("CREDIT", "DEBIT"),
        allowNull: false,
        defaultValue: "CREDIT"
      },

      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },

      currency: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "KES"
      },

      description: {
        type: Sequelize.STRING,
        allowNull: true
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("LedgerEntries");
  }
};
