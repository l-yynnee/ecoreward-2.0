const router = require("express").Router();
const { getPublicStats } = require("./stats.controller");

// Public
router.get("/public", getPublicStats);

module.exports = router;