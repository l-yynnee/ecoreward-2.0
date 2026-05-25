'use strict';

/** @type {import('sequelize-cli').Migration} */
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Pickups", "tracking_status", {
      type: Sequelize.ENUM("ASSIGNED", "EN_ROUTE", "ARRIVED"),
      allowNull: true
    });

    await queryInterface.addColumn("Pickups", "estimated_points", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    });

    await queryInterface.addColumn("Pickups", "verified_points", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Pickups", "tracking_status");
    await queryInterface.removeColumn("Pickups", "estimated_points");
    await queryInterface.removeColumn("Pickups", "verified_points");

    // Important: Sequelize ENUM cleanup (MySQL sometimes keeps enums)
    // You can leave this if it causes issues, but usually safe:
    // await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_Pickups_tracking_status;");
  }
};