const { Op } = require("sequelize");
const { Pickup, LedgerEntry } = require("../../../models");

exports.getPublicStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const total_pickups_completed = await Pickup.count({
      where: { status: "PAID" }
    });

    const total_waste_kg = await Pickup.sum("estimated_kg", {
      where: { status: "PAID" }
    });

    const total_tokens_issued = await LedgerEntry.sum("amount", {
      where: { entry_type: "CREDIT" }
    });

    const active_users_30d = await Pickup.count({
      distinct: true,
      col: "citizen_id",
      where: { createdAt: { [Op.gte]: thirtyDaysAgo } }
    });

    return res.json({
      total_waste_kg: Number(total_waste_kg || 0),
      total_pickups_completed,
      total_tokens_issued: Number(total_tokens_issued || 0),
      active_users_30d
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};