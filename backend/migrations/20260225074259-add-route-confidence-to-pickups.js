'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Pickups", "route_confidence", {
      type: Sequelize.DECIMAL(5, 2), // e.g. 87.50
      allowNull: true
    });

    await queryInterface.addColumn("Pickups", "batch_confidence", {
      type: Sequelize.DECIMAL(5, 2), // e.g. 82.10
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Pickups", "route_confidence");
    await queryInterface.removeColumn("Pickups", "batch_confidence");
  }
};