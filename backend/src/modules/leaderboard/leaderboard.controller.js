
const { LedgerEntry, User, Sequelize } = require("../../../models");
const { Op } = require ("sequelize");

exports.getWeeklyLeaderboard = async (req, res) => {
try {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const rows = await LedgerEntry.findAll({
        where: {
            entry_type: "CREDIT",
            createdAt: { [Op.gte]: since }
        },
        attributes: [
            "user_id",
            [Sequelize.fn("SUM", Sequelize.col("amount")), "points"]
        ],
        group: ["user_id"],
        order: [[Sequelize.literal("points"), "DESC"]],
        limit: 10,
        raw: true
    });
    const userIds = rows.map(r => r.user_id);
    const users = await User.findAll({
        where: { id: { [Op.in]: userIds } },
        attributes: ["id", "name"]
    });
    const nameById = {};
    Object.fromEntries(users.map(u => [u.id, u.name]));

    return res.json(rows.map(r => ({
        user_id: r.user_id,
        name: nameById[r.user_id] || "User",
        points: Number(r.points || 0)
    })));
} catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
}
};