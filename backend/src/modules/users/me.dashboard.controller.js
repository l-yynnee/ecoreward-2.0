const { Pickup, LedgerEntry } = require("../../../models");
const { Op } = require("sequelize");

/**
 * GET /me/dashboard (Citizen)
 * Returns: total_pickups, total_points_earned, total_kg_recycled, balance
 */
exports.getMyDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1) Total pickups for this citizen
    const total_pickups = await Pickup.count({
      where: { citizen_id: userId }
    });

    // 2) Total kg recycled (use RECEIVED/PAID/TRANSFERRED depending on your "recycled" definition)
    // MVP choice: treat RECEIVED and PAID as "recycled"
    const recycledStatuses = ["RECEIVED", "PAID"];
    const total_kg_recycled = await Pickup.sum("estimated_kg", {
      where: {
        citizen_id: userId,
        status: { [Op.in]: recycledStatuses }
      }
    });

    // 3) Total points earned from ledger credits (assuming ledger amount = points or money; you use KES now)
    // If you treat points separately from money, adjust later.
    const total_points_earned = await LedgerEntry.sum("amount", {
      where: {
        user_id: userId,
        entry_type: "CREDIT"
      }
    });

    // 4) Current balance (credits - debits)
    const total_credit = await LedgerEntry.sum("amount", {
      where: { user_id: userId, entry_type: "CREDIT" }
    });

    const total_debit = await LedgerEntry.sum("amount", {
      where: { user_id: userId, entry_type: "DEBIT" }
    });

    const balance = Number(total_credit || 0) - Number(total_debit || 0);

    return res.json({
      total_pickups,
      total_kg_recycled: Number(total_kg_recycled || 0),
      total_points_earned: Number(total_points_earned || 0),
      balance
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};