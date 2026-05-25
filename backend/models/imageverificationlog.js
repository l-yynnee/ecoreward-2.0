module.exports = (sequelize, DataTypes) => {
  const ImageVerificationLog = sequelize.define("ImageVerificationLog", {
    pickup_id: DataTypes.INTEGER,
    verified_by_user_id: DataTypes.INTEGER,
    image_url: DataTypes.STRING,
    declared_waste_type: DataTypes.STRING,
    predicted_material: DataTypes.STRING,
    confidence_score: DataTypes.DECIMAL(5, 2),
    is_match: DataTypes.BOOLEAN,
    notes: DataTypes.TEXT,
    mode: DataTypes.STRING
  });

  ImageVerificationLog.associate = (models) => {
    ImageVerificationLog.belongsTo(models.Pickup, { foreignKey: "pickup_id" });
    ImageVerificationLog.belongsTo(models.User, { foreignKey: "verified_by_user_id" });
  };

  return ImageVerificationLog;
};