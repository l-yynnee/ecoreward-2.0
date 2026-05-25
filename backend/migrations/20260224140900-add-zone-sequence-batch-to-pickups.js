'use strict';


module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Pickups", "zone", {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn("Pickups", "sequence_no", {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn("Pickups", "batch_id", {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Pickups", "zone");
    await queryInterface.removeColumn("Pickups", "sequence_no");
    await queryInterface.removeColumn("Pickups", "batch_id");
  }
};