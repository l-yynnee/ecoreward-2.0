'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
  

    

    await queryInterface.addColumn("Pickups", "route_order", {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn("Pickups", "eta_minutes", {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    
  },

  async down(queryInterface) {
    
    
    await queryInterface.removeColumn("Pickups", "route_order");
    await queryInterface.removeColumn("Pickups", "eta_minutes");
  }
};