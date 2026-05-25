const router = require("express").Router();
const auth = require("../../middlewares/auth");

// MVP static demand feed
router.get("/demand", auth, async (req, res) => {
  // Later: replace with DB table or DS feed
  res.json([
    { material_type: "Plastic", demand_score: 0.92, unit: "kg", suggested_rate: 15 },
    { material_type: "Glass", demand_score: 0.74, unit: "kg", suggested_rate: 10 },
    { material_type: "Paper", demand_score: 0.68, unit: "kg", suggested_rate: 6},
    { material_type: "Metal", demand_score: 0.88, unit: "kg", suggested_rate: 20 }
  ]);
});

module.exports = router;