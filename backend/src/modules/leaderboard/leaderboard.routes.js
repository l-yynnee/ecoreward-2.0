const router = require('express').Router();
const auth = require("../../middlewares/auth");
const { getWeeklyLeaderboard } = require("./leaderboard.controller");

router.get("/weekly", auth, getWeeklyLeaderboard);

module.exports = router;