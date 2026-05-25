const { Op } = require("sequelize");
const { Pickup, sequelize } = require("../../../models");
const { LedgerEntry } = require("../../../models");
const { User } = require("../../../models");
const { ImageVerificationLog } = require("../../../models");
exports.getMetrics = async (req, res) => {
  try {
    const { from, to } = req.query;

    const dateFilter = {};

    if (from && to) {
      dateFilter.createdAt = {
        [Op.between]: [new Date(from), new Date(to)]
      };
    }

    // ----------------------------
    // Counts by status
    // ----------------------------
    const rows = await Pickup.findAll({
      where: dateFilter,
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"]
      ],
      group: ["status"]
    });

    const counts_by_status = rows.reduce((acc, r) => {
      acc[r.status] = Number(r.get("count"));
      return acc;
    }, {});

    // ----------------------------
    // Totals
    // ----------------------------
    const total_pickups = await Pickup.count({ where: dateFilter });

    const total_paid_pickups = await Pickup.count({
      where: { ...dateFilter, status: "PAID" }
    });

    const completion_rate =
      total_pickups > 0
        ? Number(((total_paid_pickups / total_pickups) * 100).toFixed(2))
        : 0;
    // Avg response time (REQUESTED -> ASSIGNED) in decimal hours
const responseRows = await Pickup.findAll({
  where: { ...dateFilter, status: "ASSIGNED" },
  attributes: [
    [
      sequelize.fn(
        "AVG",
        sequelize.fn(
          "TIMESTAMPDIFF",
          sequelize.literal("MINUTE"),
          sequelize.col("createdAt"),
          sequelize.col("updatedAt")
        )
      ),
      "avg_minutes"
    ]
  ]
});

const avg_minutes = Number(responseRows[0]?.get("avg_minutes")) || 0;

const avg_response_time_hours = Number((avg_minutes / 60).toFixed(2));
    const total_paid_payout = await Pickup.sum("calculated_payout", {
      where: { ...dateFilter, status: "PAID" }
    });

    const total_transferred_payout = await Pickup.sum("calculated_payout", {
      where: { ...dateFilter, status: "TRANSFERRED" }
    });

    const total_estimated_kg = await Pickup.sum("estimated_kg", {
      where: dateFilter
    });

    // ----------------------------
    // Ledger Metrics
    // ----------------------------
    const total_ledger_entries = await LedgerEntry.count();

    const total_credit_amount = await LedgerEntry.sum("amount", {
      where: { entry_type: "CREDIT" }
    });

    const total_users = await User.count();

    const avg_tokens_per_user =
      total_users > 0
        ? Number((Number(total_credit_amount || 0) / total_users).toFixed(2))
        : 0;

    // ----------------------------
    // Environmental Metrics
    // ----------------------------
    const transferred_kg = await Pickup.sum("estimated_kg", {
      where: { ...dateFilter, status: "TRANSFERRED" }
    });

    const received_kg = await Pickup.sum("estimated_kg", {
      where: { ...dateFilter, status: "RECEIVED" }
    });

    const wtCountRows = await Pickup.findAll({
      where: dateFilter,
      attributes: [
        "waste_type",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"]
      ],
      group: ["waste_type"]
    });

    const waste_type_counts = wtCountRows.reduce((acc, r) => {
      acc[r.waste_type] = Number(r.get("count"));
      return acc;
    }, {});

    const wtKgRows = await Pickup.findAll({
      where: dateFilter,
      attributes: [
        "waste_type",
        [sequelize.fn("SUM", sequelize.col("estimated_kg")), "kg"]
      ],
      group: ["waste_type"]
    });

    const waste_type_kg = wtKgRows.reduce((acc, r) => {
      acc[r.waste_type] = Number(r.get("kg") || 0);
      return acc;
    }, {});

    const totalKg =
      Object.values(waste_type_kg).reduce((a, b) => a + b, 0) || 1;

    const waste_type_percent = Object.fromEntries(
      Object.entries(waste_type_kg).map(([k, v]) => [
        k,
        Math.round((v / totalKg) * 100)
      ])
    );
    // Collector earnings leaderboard (sum of PAID payouts per collector)
const collectorRows = await Pickup.findAll({
  where: { ...dateFilter, status: "PAID" },
  attributes: [
    "collector_id",
    [sequelize.fn("SUM", sequelize.col("calculated_payout")), "earnings"],
    [sequelize.fn("COUNT", sequelize.col("id")), "paid_pickups"]
  ],
  group: ["collector_id"],
  order: [[sequelize.literal("earnings"), "DESC"]]
});

const collector_earnings = collectorRows.map(r => ({
  collector_id: r.collector_id,
  earnings: Number(r.get("earnings") || 0),
  paid_pickups: Number(r.get("paid_pickups") || 0)
}));


// Hotspots: top addresses by pickup volume (for maps / charts)
const hotspotRows = await Pickup.findAll({
  where: dateFilter,
  attributes: [
    "address",
    [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    [sequelize.fn("SUM", sequelize.col("estimated_kg")), "kg"]
  ],
  group: ["address"],
  order: [[sequelize.literal("count"), "DESC"]],
  limit: 5
});

const hotspots = hotspotRows.map(r => ({
  address: r.address,
  count: Number(r.get("count") || 0),
  kg: Number(r.get("kg") || 0)
}));

    // ----------------------------
    // Active Users (last 30 days)
    // ----------------------------
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const active_users = await Pickup.count({
      distinct: true,
      col: "citizen_id",
      where: {
        createdAt: { [Op.gte]: thirtyDaysAgo }
      }
    });
    const avg_confidence = await Pickup.sum("ai_confidence_score", {
  where: dateFilter
});

const confidence_count = await Pickup.count({
  where: {
    ...dateFilter,
    ai_confidence_score: { [Op.not]: null }
  }
});

const average_ai_confidence = confidence_count
  ? Number((avg_confidence / confidence_count).toFixed(2))
  : 0;
// ---- Route Optimization Confidence Metrics ----

// Average per-pickup route confidence (only rows that have it)
const avg_route_confidence_raw = await Pickup.findOne({
  where: { ...dateFilter, route_confidence: { [Op.ne]: null } },
  attributes: [[sequelize.fn("AVG", sequelize.col("route_confidence")), "avg"]],
  raw: true
});

// Average batch confidence (only rows that have it)
const avg_batch_confidence_raw = await Pickup.findOne({
  where: { ...dateFilter, batch_confidence: { [Op.ne]: null } },
  attributes: [[sequelize.fn("AVG", sequelize.col("batch_confidence")), "avg"]],
  raw: true
});

// Count low confidence pickups (< 50)
const low_confidence_pickups = await Pickup.count({
  where: {
    ...dateFilter,
    route_confidence: { [Op.lt]: 50 }
  }
});

// Count optimized pickups (has a batch_id OR sequence_no)
const optimized_pickups = await Pickup.count({
  where: {
    ...dateFilter,
    [Op.or]: [
      { batch_id: { [Op.ne]: null } },
      { sequence_no: { [Op.ne]: null } }
    ]
  }
});

// Convert AVG results safely (decimal precision)
const avg_route_confidence = Number(
  avg_route_confidence_raw?.avg ? Number(avg_route_confidence_raw.avg).toFixed(2) : 0
);

const avg_batch_confidence = Number(
  avg_batch_confidence_raw?.avg ? Number(avg_batch_confidence_raw.avg).toFixed(2) : 0
);

// ---- Image Verification Metrics ----
const total_verified_attempts = await ImageVerificationLog.count();

const total_verified_true = await ImageVerificationLog.count({
  where: { is_match: true }
});

const total_verified_false = await ImageVerificationLog.count({
  where: { is_match: false }
});

const avg_image_verification_score_raw = await ImageVerificationLog.findOne({
  attributes: [[sequelize.fn("AVG", sequelize.col("confidence_score")), "avg"]],
  raw: true
});

const avg_image_verification_score = Number(
  avg_image_verification_score_raw?.avg ? Number(avg_image_verification_score_raw.avg).toFixed(2) : 0
);

// Pickups currently flagged for review
const pickups_needing_review = await Pickup.count({
  where: { needs_review: true }
});
    // ----------------------------
    // Final Response
    // ----------------------------
    return res.json({
      total_pickups,
      counts_by_status,
      completion_rate,
      avg_response_time_hours,
      total_paid_payout: Number(total_paid_payout || 0),
      total_transferred_payout: Number(total_transferred_payout || 0),
      total_estimated_kg: Number(total_estimated_kg || 0),
      total_paid_pickups,
      total_ledger_entries,
      total_credit_amount: Number(total_credit_amount || 0),
      avg_tokens_per_user,
      transferred_kg: Number(transferred_kg || 0),
      received_kg: Number(received_kg || 0),
      collector_earnings,
      hotspots,
      active_users,
      average_ai_confidence,
      avg_route_confidence,
      avg_batch_confidence,
      low_confidence_pickups,
      optimized_pickups,
      waste_type_counts,
      waste_type_kg,
      waste_type_percent,
      total_verified_attempts,
      total_verified_true,
      total_verified_false,
      avg_image_verification_score,
      pickups_needing_review
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.getConfidenceTrend = async (req, res) => {
  try {
    const days = Number(req.query.days || 7);

    const start = new Date();
    start.setDate(start.getDate() - days);

    const rows = await Pickup.findAll({
      where: {
        ai_confidence_score: { [Op.not]: null },
        createdAt: { [Op.gte]: start }
      },
      attributes: [
        [sequelize.fn("DATE", sequelize.col("createdAt")), "day"],
        [sequelize.fn("AVG", sequelize.col("ai_confidence_score")), "avg_confidence"],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"]
      ],
      group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
      order: [[sequelize.literal("day"), "ASC"]]
    });

    const trend = rows.map(r => ({
      day: r.get("day"),
      avg_confidence: Number(Number(r.get("avg_confidence") || 0).toFixed(2)),
      count: Number(r.get("count") || 0)
    }));

    return res.json({ days, trend });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};
exports.getRecentPickups = async (req, res) => {
  const rows = await Pickup.findAll({
    attributes: [
      "id",
      "address",
      "status",
      "calculated_payout",
      "updatedAt"
    ],
    order: [["updatedAt", "DESC"]],
    limit: 10
  });

  return res.json(rows);
};
exports.getLedgerAudit = async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 50), 200);

  const rows = await LedgerEntry.findAll({
    attributes: [
      "id",
      "user_id",
      "pickup_id",
      "entry_type",
      "amount",
      "currency",
      "description",
      "createdAt"
    ],
    order: [["createdAt", "DESC"]],
    limit
  });

  return res.json(rows);
};
exports.getBatchPickups = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 200);
    const status = req.query.status || "REQUESTED";
    const missing_zone = req.query.missing_zone === "1";
    const missing_assignee = req.query.missing_assignee === "1";

    const where = { status };

    if (missing_zone) where.zone = null;
    if (missing_assignee) where.collector_id = null;

    const pickups = await Pickup.findAll({
      where,
      limit,
      order: [["createdAt", "ASC"]],
      attributes: [
        "id",
        "address",
        "waste_type",
        "estimated_kg",
        "status",
        "zone",
        "collector_id",
        "sequence_no",
        "batch_id",
        "createdAt"
      ]
    });

    return res.json({ count: pickups.length, pickups });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.applyBatchAssignments = async (req, res) => {
  try {
    const { batch_id, batch_confidence, updates } = req.body;

    if (!batch_id || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: "batch_id and updates[] are required" });
    }

    const results = [];

    for (const u of updates) {
      const { pickup_id, zone, collector_id, sequence_no } = u;

      if (!pickup_id || !collector_id) {
        results.push({ pickup_id, ok: false, message: "pickup_id and collector_id required" });
        continue;
      }

      const pickup = await Pickup.findByPk(pickup_id);
      if (!pickup) {
        results.push({ pickup_id, ok: false, message: "Pickup not found" });
        continue;
      }

      if (pickup.status !== "REQUESTED") {
        results.push({ pickup_id, ok: false, message: "Pickup must be REQUESTED" });
        continue;
      }

      const route_confidence =
       u.confidence_score !== undefined ? Number(u.confidence_score) : null;

      const bc = batch_confidence !== undefined ? Number(batch_confidence) : null;

      // confirm collector exists and is COLLECTOR
      const collector = await User.findByPk(collector_id);
      if (!collector || collector.role !== "COLLECTOR") {
        results.push({ pickup_id, ok: false, message: "Invalid collector_id" });
        continue;
      }

      await pickup.update({
        zone: zone ?? pickup.zone,
        collector_id,
        sequence_no: sequence_no ?? pickup.sequence_no,
        batch_id,
        route_confidence,
        batch_confidence: bc,
        status: "ASSIGNED"
      });

      results.push({ pickup_id, ok: true, status: pickup.status, collector_id, zone: pickup.zone, sequence_no: pickup.sequence_no });
    }

    return res.json({ batch_id, results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};