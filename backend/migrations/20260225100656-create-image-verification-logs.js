'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ImageVerificationLogs", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      pickup_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Pickups", key: "id" },
        onDelete: "CASCADE"
      },
      verified_by_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onDelete: "CASCADE"
      },
      image_url: { type: Sequelize.STRING, allowNull: false },
      declared_waste_type: { type: Sequelize.STRING, allowNull: true },
      predicted_material: { type: Sequelize.STRING, allowNull: true },
      confidence_score: { type: Sequelize.DECIMAL(5, 2), allowNull: true }, // 0–100
      is_match: { type: Sequelize.BOOLEAN, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      mode: { type: Sequelize.STRING, allowNull: false, defaultValue: "mock" }, // mock/live
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("ImageVerificationLogs");
  }
};