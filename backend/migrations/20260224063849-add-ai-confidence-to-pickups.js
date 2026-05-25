'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Pickups", "ai_confidence_score", {
      type: Sequelize.FLOAT,
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Pickups", "ai_confidence_score");
  }
};