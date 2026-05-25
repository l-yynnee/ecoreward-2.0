'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Pickups", "image_url", {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn("Pickups", "image_verified", {
      type: Sequelize.BOOLEAN,
      allowNull: true
    });

    await queryInterface.addColumn("Pickups", "image_verification_score", {
      type: Sequelize.DECIMAL(5, 2), // store 0–100 like 87.50
      allowNull: true
    });

    await queryInterface.addColumn("Pickups", "image_verification_label", {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn("Pickups", "image_verification_notes", {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Pickups", "image_url");
    await queryInterface.removeColumn("Pickups", "image_verified");
    await queryInterface.removeColumn("Pickups", "image_verification_score");
    await queryInterface.removeColumn("Pickups", "image_verification_label");
    await queryInterface.removeColumn("Pickups", "image_verification_notes");
  }
};