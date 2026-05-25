'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Pickups", "recycling_center_id", {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn("Pickups", "material_type", {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn("Pickups", "unit_name", {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn("Pickups", "unit_count", {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    // snapshot the unit price at time of transfer (audit-safe)
    await queryInterface.addColumn("Pickups", "unit_price_snapshot", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });

    await queryInterface.addColumn("Pickups", "calculated_payout", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Pickups", "calculated_payout");
    await queryInterface.removeColumn("Pickups", "unit_price_snapshot");
    await queryInterface.removeColumn("Pickups", "unit_count");
    await queryInterface.removeColumn("Pickups", "unit_name");
    await queryInterface.removeColumn("Pickups", "material_type");
    await queryInterface.removeColumn("Pickups", "recycling_center_id");
  }
};
