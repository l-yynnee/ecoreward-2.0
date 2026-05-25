const router = require("express").Router();
const auth = require("../../middlewares/auth");
const { User } = require("../../../models");
const { getMyDashboard } = require("./me.dashboard.controller");
// GET /users/me
router.get("/me/dashboard", auth, getMyDashboard);
router.get("/me", auth, async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: ["id", "name", "email", "phone", "role", "points", "createdAt"]
  });

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json(user);
});

module.exports = router;

