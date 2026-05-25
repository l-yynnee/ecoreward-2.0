const Joi = require("joi");
const { Pickup, UnitPrice, LedgerEntry, User } = require("../../../models");
const {Op} = require("sequelize");
const createSchema = Joi.object({
  address: Joi.string().required(),
  waste_type: Joi.string().required(),
  estimated_kg: Joi.number().positive().required()
});

const settleSchema = Joi.object({
  material_type: Joi.string().required(),
  unit_count: Joi.number().integer().positive().required()
});
const imageSchema = Joi.object({
  image_url: Joi.string().uri().required()
});

exports.attachPickupImage = async (req, res) => {
  try {
    const { error, value } = imageSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const pickup = await Pickup.findByPk(req.params.id);
    if (!pickup) return res.status(404).json({ message: "Pickup not found" });

    // Ownership rules:
    // - CITIZEN can attach image only to their pickup
    // - COLLECTOR can attach image only to pickups assigned to them
    if (req.user.role === "CITIZEN" && pickup.citizen_id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (req.user.role === "COLLECTOR" && pickup.collector_id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // ADMIN can attach image too (optional)
    if (!["CITIZEN", "COLLECTOR", "ADMIN"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await pickup.update({
      image_url: value.image_url,
      // Reset verification fields when image changes
      image_verified: null,
      image_verification_score: null,
      image_verification_label: null,
      image_verification_notes: null
    });

    return res.json(pickup);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};




exports.createPickup = async (req, res) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const pickup = await Pickup.create({
    citizen_id: req.user.id,        // from JWT
    address: value.address,
    waste_type: value.waste_type,
    estimated_kg: value.estimated_kg,
    status: "REQUESTED"
  });
  

  return res.status(201).json(pickup);
};

exports.listMyPickups = async (req, res) => {
  const pickups = await Pickup.findAll({
    where: { citizen_id: req.user.id },
    order: [["createdAt", "DESC"]]
  });

  return res.json(pickups);
};
//console.log(Object.keys(require("../../../models")));
exports.listAvailablePickups = async (req, res) => {
  const pickups = await Pickup.findAll({
    where: { status: "REQUESTED" },
    order: [["createdAt", "ASC"]]
  });
  res.json(pickups);
};

exports.listAllPickups = async (req, res) => {
  const pickups = await Pickup.findAll({
    order: [["createdAt", "DESC"]]
  });
  res.json(pickups);
};
exports.assignPickup = async (req, res) => {
  const pickup = await Pickup.findByPk(req.params.id);

  if (!pickup) return res.status(404).json({ message: "Pickup not found" });

  if (pickup.status !== "REQUESTED") {
    return res.status(400).json({ message: "Pickup cannot be assigned" });
  }

  // if a COLLECTOR assigns, assign to themselves
  // if ADMIN assigns, allow passing collector_id optionally later; for now assign to admin? NO.
  if (req.user.role === "COLLECTOR") {
    pickup.collector_id = req.user.id;
  }

  pickup.status = "ASSIGNED";
  await pickup.save();

  res.json(pickup);
};
exports.markCollected = async (req, res) => {
  const pickup = await Pickup.findByPk(req.params.id);

  if (!pickup) return res.status(404).json({ message: "Pickup not found" });

  // ownership check
  if (pickup.collector_id !== req.user.id) {
    return res.status(403).json({ message: "Not your assigned pickup" });
  }

  // status check
  if (pickup.status !== "ASSIGNED") {
    return res.status(400).json({ message: "Pickup must be ASSIGNED to mark as COLLECTED" });
  }

  pickup.status = "COLLECTED";
  await pickup.save();

  return res.json(pickup);
};

exports.markDelivered = async (req, res) => {
  const pickup = await Pickup.findByPk(req.params.id);

  if (!pickup) return res.status(404).json({ message: "Pickup not found" });

  // ownership check
  if (pickup.collector_id !== req.user.id) {
    return res.status(403).json({ message: "Not your assigned pickup" });
  }

  // status check
  if (pickup.status !== "COLLECTED") {
    return res.status(400).json({ message: "Pickup must be COLLECTED to mark as DELIVERED" });
  }

  pickup.status = "DELIVERED";
  await pickup.save();

  return res.json(pickup);
};
exports.settlePickup = 

async (req, res) => {
  const { error, value } = settleSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const pickup = await Pickup.findByPk(req.params.id);
  if (!pickup) return res.status(404).json({ message: "Pickup not found" });

  if (pickup.status !== "TRANSFERRED") {
    return res.status(400).json({ message: "Pickup must be TRANSFERRED to settle" });
  }

  const rate = await UnitPrice.findOne({
    where: { material_type: value.material_type, is_active: true }
  });

  if (!rate) return res.status(404).json({ message: "No active unit price for this material_type" });

  const unitPrice = Number(rate.unit_price);
  const payout = unitPrice * value.unit_count;

  const confidence = Number((Math.random() * (0.95 - 0.65) + 0.65).toFixed(2));

  
  await pickup.update({
  recycling_center_id: req.user.id,
  material_type: value.material_type,
  unit_name: rate.unit_name,
  unit_count: value.unit_count,
  unit_price_snapshot: unitPrice,
  calculated_payout: payout,
  ai_confidence_score: confidence,
  
  status: "TRANSFERRED"
});


  return res.json({
    pickup_id: pickup.id,
    unit_rate: unitPrice,
    unit_name: rate.unit_name,
    quantity: value.unit_count,
    payout,
    ai_confidence_score: confidence,
    status: pickup.status
  });
};
exports.getPickupById = async (req, res) => {
  const pickup = await Pickup.findByPk(req.params.id);
  if (!pickup) return res.status(404).json({ message: "Pickup not found" });

  // Admin can view any pickup
  if (req.user.role === "ADMIN") return res.json(pickup);

  // Collector can view pickups assigned to them
  if (req.user.role === "COLLECTOR") {
    if (pickup.collector_id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return res.json(pickup);
  }

  // Citizen can view their own pickups
  if (req.user.role === "CITIZEN") {
    if (pickup.citizen_id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return res.json(pickup);
  }

  return res.status(403).json({ message: "Forbidden" });
};
exports.markTransferred = async (req, res) => {
  const pickup = await Pickup.findByPk(req.params.id);
  if (!pickup) return res.status(404).json({ message: "Pickup not found" });

  if (pickup.status !== "DELIVERED") {
    return res.status(400).json({ message: "Pickup must be DELIVERED to mark as TRANSFERRED" });
  }

  // collector ownership check
  if (pickup.collector_id !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await pickup.update({ status: "TRANSFERRED" });
  return res.json(pickup);
};
exports.markReceived = async (req, res) => {
  const pickup = await Pickup.findByPk(req.params.id);
  if (!pickup) return res.status(404).json({ message: "Pickup not found" });

  if (pickup.status !== "TRANSFERRED") {
    return res.status(400).json({ message: "Pickup must be TRANSFERRED to mark as RECEIVED" });
  }

  //settlement must exist before marking received; this is a safety check, normally should not fail if workflow is followed
  if (!pickup.calculated_payout || !pickup.unit_count || !pickup.unit_price_snapshot) {
  return res.status(400).json({ message: "Pickup must be settled before marking as RECEIVED" });
}


  await pickup.update({ status: "RECEIVED" });

  return res.json(pickup);
  
};


exports.markPaid = async (req, res) => {
  const pickup = await Pickup.findByPk(req.params.id);
  if (!pickup) return res.status(404).json({ message: "Pickup not found" });

  if (pickup.status !== "RECEIVED") {
    return res.status(400).json({ message: "Pickup must be RECEIVED to mark as PAID" });
  }
  
  // optional safety check: must have payout calculated
  if (!pickup.calculated_payout || Number(pickup.calculated_payout) <= 0) {
    return res.status(400).json({ message: "Cannot mark PAID without a valid payout" });
  }
  const existing = await LedgerEntry.findOne({ where: { pickup_id: pickup.id } });
  if (existing) return res.status(409).json({ message: "Pickup already paid" });

  await pickup.update({ status: "PAID" });
  await LedgerEntry.create({
  user_id: pickup.citizen_id,
  pickup_id: pickup.id,
  entry_type: "CREDIT",
  amount: pickup.calculated_payout,
  currency: "KES",
  description: `Payout for pickup #${pickup.id}`
});
  const pointsPerShilling = 1; // MVP ratio

const earnedPoints = Math.floor(Number(pickup.calculated_payout) * pointsPerShilling);

await User.increment(
  { points: earnedPoints },
  { where: { id: pickup.citizen_id } }
);


  return res.json(pickup);
};
exports.listMyAssignedPickups = async (req, res) => {
  const where = { collector_id: req.user.id };

  //optional filter:active= true
  

if (req.query.active === "true") {
  where[Op.and] = [
    { status: ["ASSIGNED", "COLLECTED", "DELIVERED", "TRANSFERRED", "RECEIVED"] },
    {
      [Op.or]: [
        // allow normal in-progress work
        { status: ["ASSIGNED", "COLLECTED", "DELIVERED"] },

        // for settlement states, require payout exists
        {
          status: ["TRANSFERRED", "RECEIVED"],
          calculated_payout: { [Op.ne]: null }
        }
      ]
    }
  ];
}

  const pickups = await Pickup.findAll({
    where,
    order: [["sequence_no", "ASC"],
    ["createdAt", "ASC"]]
  });

  return res.json(pickups);
};
exports.cancelPickup = async (req, res) => {
  const pickup = await Pickup.findByPk(req.params.id);
  if (!pickup) return res.status(404).json({ message: "Pickup not found" });

  // CITIZEN: can cancel only own pickup, only when REQUESTED
  if (req.user.role === "CITIZEN") {
    if (pickup.citizen_id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (pickup.status !== "REQUESTED") {
      return res.status(400).json({ message: "Only REQUESTED pickups can be cancelled by citizen" });
    }
  }

  // ADMIN: can cancel REQUESTED or ASSIGNED
  if (req.user.role === "ADMIN") {
    if (!["REQUESTED", "ASSIGNED"].includes(pickup.status)) {
      return res.status(400).json({ message: "Only REQUESTED or ASSIGNED pickups can be cancelled by admin" });
    }
  }

  // other roles cannot cancel
  if (!["CITIZEN", "ADMIN"].includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await pickup.update({ status: "CANCELLED" });
  return res.json(pickup);
};

const pickupSummaryFields = [
  "id",
  "address",
  "waste_type",
  "status",
  "unit_count",
  "calculated_payout",
  "updatedAt",
  "createdAt"
];
exports.markCollectorEnRoute = async (req, res) => {
  try {
    const { id } = req.params;

    const pickup = await Pickup.findByPk(id);
    if (!pickup) return res.status(404).json({ message: "Pickup not found" });

    const isAdmin = req.user.role === "ADMIN";
    const isCollector = req.user.role === "COLLECTOR";

    if (!isAdmin && !isCollector) return res.status(403).json({ message: "Forbidden" });

    // If collector, must be assigned to them
    if (isCollector && pickup.collector_id !== req.user.id) {
      return res.status(403).json({ message: "Not your pickup" });
    }

    if (pickup.status !== "ASSIGNED") {
      return res.status(400).json({ message: "Pickup must be ASSIGNED first" });
    }

    pickup.tracking_status = "EN_ROUTE";
    await pickup.save();

    return res.json({ message: "Collector marked EN_ROUTE", pickup });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PATCH /pickups/:id/arrive (Collector/Admin)
 * Rule: pickup must be ASSIGNED and already EN_ROUTE (or allow direct ASSIGNED -> ARRIVED)
 */
exports.markCollectorArrived = async (req, res) => {
  try {
    const { id } = req.params;

    const pickup = await Pickup.findByPk(id);
    if (!pickup) return res.status(404).json({ message: "Pickup not found" });

    const isAdmin = req.user.role === "ADMIN";
    const isCollector = req.user.role === "COLLECTOR";

    if (!isAdmin && !isCollector) return res.status(403).json({ message: "Forbidden" });

    if (isCollector && pickup.collector_id !== req.user.id) {
      return res.status(403).json({ message: "Not your pickup" });
    }

    if (pickup.status !== "ASSIGNED") {
      return res.status(400).json({ message: "Pickup must be ASSIGNED first" });
    }

    // Strict (recommended)
    if (pickup.tracking_status !== "EN_ROUTE") {
      return res.status(400).json({ message: "Pickup must be EN_ROUTE before ARRIVED" });
    }

    pickup.tracking_status = "ARRIVED";
    await pickup.save();

    return res.json({ message: "Collector marked ARRIVED", pickup });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.listMyPickupsSummary = async (req, res) => {
  const rows = await Pickup.findAll({
    where: { citizen_id: req.user.id },
    attributes: pickupSummaryFields,
    order: [["updatedAt", "DESC"]]
  });
  return res.json(rows);
};

exports.listMyAssignedPickupsSummary = async (req, res) => {
  const where = { collector_id: req.user.id };
  if (req.query.active === "true") {
    where.status = ["ASSIGNED", "COLLECTED", "DELIVERED", "TRANSFERRED", "RECEIVED"];
  }
  const rows = await Pickup.findAll({
    where,
    attributes: pickupSummaryFields,
    order: [["updatedAt", "DESC"]]
  });
  return res.json(rows);
};








