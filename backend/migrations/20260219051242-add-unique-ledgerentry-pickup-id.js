"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.addConstraint("LedgerEntries", {
      fields: ["pickup_id"],
      type: "unique",
      name: "uniq_ledgerentries_pickup_id"
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint("LedgerEntries", "uniq_ledgerentries_pickup_id");
  }
};
