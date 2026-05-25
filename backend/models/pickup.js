'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pickup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Pickup.init({
    citizen_id: DataTypes.INTEGER,
    collector_id: DataTypes.INTEGER,
    address: DataTypes.STRING,
    waste_type: DataTypes.STRING,
    estimated_kg: DataTypes.FLOAT,
    recycling_center_id: DataTypes.INTEGER,
    material_type: DataTypes.STRING,
    unit_name: DataTypes.STRING,
    unit_count: DataTypes.INTEGER,
    unit_price_snapshot: DataTypes.DECIMAL(10, 2),
    calculated_payout: DataTypes.DECIMAL(10, 2),
    ai_confidence_score: {
    type: DataTypes.FLOAT,
    allowNull: true
    },
    zone:{type: DataTypes.STRING, allowNull: true},
    sequence_no:{type: DataTypes.INTEGER, allowNull: true},
    batch_id:{type: DataTypes.STRING, allowNull: true},
    route_order:{type: DataTypes.INTEGER, allowNull: true},
    eta_minutes:{type: DataTypes.INTEGER, allowNull: true},
    route_confidence:{type: DataTypes.DECIMAL(5, 2), allowNull: true},
    batch_confidence:{type: DataTypes.DECIMAL(5, 2), allowNull: true},
    image_url: { type: DataTypes.STRING, allowNull: true },
    image_verified: { type: DataTypes.BOOLEAN, allowNull: true },
    image_verification_score: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    image_verification_label: { type: DataTypes.STRING, allowNull: true },
    image_verification_notes: { type: DataTypes.TEXT, allowNull: true },
    needs_review: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    review_reason: { type: DataTypes.TEXT, allowNull: true },
    tracking_status: DataTypes.ENUM("ASSIGNED", "EN_ROUTE", "ARRIVED"),
    estimated_points: DataTypes.DECIMAL(10, 2),
    verified_points: DataTypes.DECIMAL(10, 2),
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Pickup',
  });
  return Pickup;
};