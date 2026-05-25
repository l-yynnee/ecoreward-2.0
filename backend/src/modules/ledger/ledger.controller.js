const { LedgerEntry, sequelize } = require("../../../models");

exports.getMyLedger = async (req, res) => {
  const rows = await LedgerEntry.findAll({
    where: { user_id: req.user.id },
    order: [["createdAt", "DESC"]],
    limit: 50
  });

  return res.json(rows);
};

exports.getMyBalance = async (req, res) => {
  const credit = await LedgerEntry.sum("amount", {
    where: { user_id: req.user.id, entry_type: "CREDIT" }
  });

  const debit = await LedgerEntry.sum("amount", {
    where: { user_id: req.user.id, entry_type: "DEBIT" }
  });

  const balance = Number(credit || 0) - Number(debit || 0);

  return res.json({ balance });
};
