const router = require("express").Router();
const auth = require("../../middlewares/auth");
const requireRole = require("../../middlewares/requireRole");
const { createUnitPrice, listUnitPrices } = require("./pricing.controller");

router.post("/", auth, requireRole("ADMIN"), createUnitPrice);
router.get("/", auth, listUnitPrices); // allow any logged-in role to view rates

module.exports = router;
