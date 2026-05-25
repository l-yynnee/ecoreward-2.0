const router = require("express").Router();
const auth = require("../../middlewares/auth");
const requireRole = require("../../middlewares/requireRole");
const { getMyLedger, getMyBalance } = require("./ledger.controller");

router.get("/me/ledger", auth, requireRole("CITIZEN"), getMyLedger);
router.get("/me/balance", auth, requireRole("CITIZEN"), getMyBalance);

module.exports = router;
