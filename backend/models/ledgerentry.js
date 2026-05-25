"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class LedgerEntry extends Model {
    static associate(models) {
      LedgerEntry.belongsTo(models.User, { foreignKey: "user_id" });
      LedgerEntry.belongsTo(models.Pickup, { foreignKey: "pickup_id" });
    }
  }

  LedgerEntry.init(
    {
      user_id: DataTypes.INTEGER,
      pickup_id: DataTypes.INTEGER,
      entry_type: DataTypes.ENUM("CREDIT", "DEBIT"),
      amount: DataTypes.DECIMAL(10, 2),
      currency: DataTypes.STRING,
      description: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "LedgerEntry"
    }
  );

  return LedgerEntry;
};
