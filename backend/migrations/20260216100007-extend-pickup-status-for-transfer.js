'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Pickups", "status", {
      type: Sequelize.ENUM(
        "REQUESTED",
        "ASSIGNED",
        "COLLECTED",
        "DELIVERED",
        "CONFIRMED",     // keep existing
        "TRANSFERRED",   // NEW
        "RECEIVED",      // NEW
        "PAID"           // NEW (optional but useful)
      ),
      allowNull: false,
      defaultValue: "REQUESTED"
    });
  },

  async down(queryInterface, Sequelize) {
    // revert to original enum (keep it simple)
    await queryInterface.changeColumn("Pickups", "status", {
      type: Sequelize.ENUM(
        "REQUESTED",
        "ASSIGNED",
        "COLLECTED",
        "DELIVERED",
        "CONFIRMED"
      ),
      allowNull: false,
      defaultValue: "REQUESTED"
    });
  }
};
