const router = require('express').Router();
const auth = require('../../middlewares/auth');
const requireRole = require('../../middlewares/requireRole');

//reuses existing pickup controllers logic

const {
    settlePickup,
    markReceived,
    markPaid
} = require("../pickups/pickups.controller");

router.patch("/pickups/:id/settle", auth, requireRole("ADMIN"), settlePickup);
router.patch("/pickups/:id/receive", auth, requireRole("ADMIN"), markReceived);
router.patch("/pickups/:id/pay", auth, requireRole("ADMIN"), markPaid);

module.exports = router;