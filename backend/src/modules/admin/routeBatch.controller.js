const { Pickup } = require("../../../models");

exports.applyRouteBatch = async (req, res) => {
  const { batch_id, zone, assignments } = req.body;

  if (!batch_id || !assignments || !Array.isArray(assignments)) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  let updated = 0;

  for (const item of assignments) {
    const pickup = await Pickup.findByPk(item.pickup_id);
    if (!pickup) continue;

    await pickup.update({
      collector_id: item.collector_id,
      batch_id,
      zone,
      route_order: item.route_order,
      eta_minutes: item.eta_minutes,
      route_confidence: item.confidence,
      status: pickup.status === "REQUESTED" ? "ASSIGNED" : pickup.status
    });

    updated++;
  }

  return res.json({
    message: "Batch applied",
    batch_id,
    total_assignments: assignments.length,
    updated
  });
};