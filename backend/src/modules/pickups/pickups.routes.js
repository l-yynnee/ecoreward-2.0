const router = require("express").Router();
const auth = require("../../middlewares/auth");
const requireRole = require("../../middlewares/requireRole");
const {
  createPickup,
  listMyPickups,
  listAvailablePickups,
  listAllPickups
} = require("./pickups.controller");

const { assignPickup } = require("./pickups.controller");
const { listMyPickupsSummary } = require("./pickups.controller");
const { listMyAssignedPickupsSummary } = require("./pickups.controller");

router.patch(
  "/:id/assign",
  auth,
  requireRole("ADMIN", "COLLECTOR"),
  assignPickup
);
const { markCollected, markDelivered, markTransferred } = require("./pickups.controller");

router.patch(
  "/:id/collect",
  auth,
  requireRole("COLLECTOR"),
  markCollected
);

router.patch(
  "/:id/deliver",
  auth,
  requireRole("COLLECTOR"),
  markDelivered
);

router.patch(
  "/:id/transfer",
  auth,
  requireRole("COLLECTOR"),
  markTransferred
);

const { settlePickup } = require("./pickups.controller");

router.patch(
  "/:id/settle",
  auth,
  requireRole("ADMIN"),
  settlePickup
);

const { getPickupById } = require("./pickups.controller");
const { markReceived } = require("./pickups.controller");
const { markPaid } = require("./pickups.controller");

const { listMyAssignedPickups } = require("./pickups.controller");
const {cancelPickup} = require("./pickups.controller");
const{ attachPickupImage } = require("./pickups.controller");

const {
  // ...existing exports
  markCollectorEnRoute,
  markCollectorArrived
} = require("./pickups.controller");

router.post("/", auth, requireRole("CITIZEN"), createPickup);
router.get("/mine", auth, requireRole("CITIZEN"), listMyPickups);
router.patch("/:id/image", auth, requireRole("CITIZEN", "COLLECTOR"), attachPickupImage);

// Collector/Admin can see REQUESTED pickups
router.get("/available", auth, requireRole("COLLECTOR", "ADMIN"), listAvailablePickups);

// Admin can see everything
router.get("/", auth, requireRole("ADMIN"), listAllPickups);

router.get(
  "/assigned/me",
  auth,
  requireRole("COLLECTOR"),
  listMyAssignedPickups
);
router.get("/mine/summary", auth, requireRole("CITIZEN"), listMyPickupsSummary);
router.get("/assigned/me/summary", auth, requireRole("COLLECTOR"), listMyAssignedPickupsSummary);

router.get("/:id", auth, getPickupById);
router.patch(
  "/:id/receive",
  auth,
  requireRole("ADMIN"),
  markReceived
);
router.patch(
  "/:id/pay",
  auth,
  requireRole("ADMIN"),
  markPaid
);

router.patch("/:id/cancel", auth, cancelPickup);
router.patch(
  "/:id/enroute",
  auth,
  requireRole("COLLECTOR"),
  markCollectorEnRoute
);
router.patch(
  "/:id/arrive",
  auth,
  requireRole("COLLECTOR"),
  markCollectorArrived
);



module.exports = router;

