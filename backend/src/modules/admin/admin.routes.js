const router = require("express").Router();
const auth = require("../../middlewares/auth");
const requireRole = require("../../middlewares/requireRole");
const { getMetrics } = require("./admin.controller");
const { getConfidenceTrend } = require("./admin.controller");
const { getRecentPickups } = require("./admin.controller");
const { getLedgerAudit } = require("./admin.controller");
const adminController = require("./admin.controller");
const requireDsKey = require("../../middlewares/requireDsKey");
const { applyRouteBatch } = require("./routeBatch.controller");
router.get("/metrics", auth, requireRole("ADMIN"), getMetrics);

router.get("/ai/confidence-trend", auth, requireRole("ADMIN"),getConfidenceTrend);
router.get("/dashboard", auth, requireRole("ADMIN"), (req, res) => {
  res.json({ message: "Welcome Admin" });
});
router.get("/recent", auth, requireRole("ADMIN"), getRecentPickups);
router.get("/ledger", auth, requireRole("ADMIN"), getLedgerAudit);
router.get("/pickups/batch", auth, requireRole("ADMIN"), adminController.getBatchPickups);
router.post("/pickups/batch/assign", auth, requireRole("ADMIN"), adminController.applyBatchAssignments);
router.post("/route-batches/apply", requireDsKey, applyRouteBatch);
module.exports = router;
