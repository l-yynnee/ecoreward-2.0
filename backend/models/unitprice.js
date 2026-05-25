'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UnitPrice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UnitPrice.init({
    material_type: DataTypes.STRING,
    unit_name: DataTypes.STRING,
    unit_price: DataTypes.DECIMAL,
    is_active: DataTypes.BOOLEAN,
    created_by: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UnitPrice',
  });
  return UnitPrice;
};