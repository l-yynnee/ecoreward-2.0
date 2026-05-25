"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Pickups", "status", {
      type: Sequelize.ENUM(
        "REQUESTED",
        "ASSIGNED",
        "COLLECTED",
        "DELIVERED",
        "CONFIRMED",
        "TRANSFERRED",
        "RECEIVED",
        "PAID",
        "CANCELLED" 
      ),
      allowNull: false,
      defaultValue: "REQUESTED"
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Pickups", "status", {
      type: Sequelize.ENUM(
        "REQUESTED",
        "ASSIGNED",
        "COLLECTED",
        "DELIVERED",
        "CONFIRMED",
        "TRANSFERRED",
        "RECEIVED",
        "PAID"
      ),
      allowNull: false,
      defaultValue: "REQUESTED"
    });
  }
};
