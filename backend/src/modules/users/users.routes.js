const router = require("express").Router();
const auth = require("../../middlewares/auth");
const { User } = require("../../../models");
const { getMyDashboard } = require("./me.dashboard.controller");
const Joi = require("joi");

// GET /users/me
router.get("/me/dashboard", auth, getMyDashboard);
router.get("/me", auth, async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: ["id", "name", "email", "phone", "role", "points", "createdAt"]
  });

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json(user);
});

// PUT /users/me - Update current user profile
const updateSchema = Joi.object({
  name: Joi.string().min(2),
  email: Joi.string().email(),
  phone: Joi.string().min(7)
}).min(1); // At least one field required

router.put("/me", auth, async (req, res) => {
  try {
    const { error, value } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    // Check if email is being updated and if it already exists
    if (value.email) {
      const existsEmail = await User.findOne({ 
        where: { email: value.email, id: { [require("sequelize").Op.ne]: req.user.id } } 
      });
      if (existsEmail) return res.status(409).json({ message: "Email already in use" });
    }

    // Check if phone is being updated and if it already exists
    if (value.phone) {
      const existsPhone = await User.findOne({ 
        where: { phone: value.phone, id: { [require("sequelize").Op.ne]: req.user.id } } 
      });
      if (existsPhone) return res.status(409).json({ message: "Phone already in use" });
    }

    const user = await User.findByPk(req.user.id);
    await user.update(value);

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      message: "Profile updated successfully"
    });
  } catch (err) {
    console.error("Update error:", err.message);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

module.exports = router;

