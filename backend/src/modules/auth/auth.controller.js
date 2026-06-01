const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { User } = require("../../../models");

const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().allow(null, ""),
  phone: Joi.string().min(7).allow(null, ""),
  password: Joi.string().min(6).required()
}).or("email", "phone"); // must have at least one

exports.register = async (req, res) => {
  try {
    console.log('Register attempt - Body received:', req.body);
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.message);
      return res.status(400).json({ message: error.message, details: "Check that you're sending: name (required), email OR phone (required), password (required, min 6 chars)" });
    }

    const { name, email, phone, password } = value;

    // check duplicates
    if (email) {
      const existsEmail = await User.findOne({ where: { email } });
      if (existsEmail) return res.status(409).json({ message: "Email already in use" });
    }
    if (phone) {
      const existsPhone = await User.findOne({ where: { phone } });
      if (existsPhone) return res.status(409).json({ message: "Phone already in use" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email || null,
      phone: phone || null,
      password_hash,
      role: "CITIZEN"
    });

    console.log('User registered:', user.id);
    return res.status(201).json({
      id: user.id,
      name: user.name,
      role: user.role
    });
  } catch (err) {
    console.error("Register error:", err.message);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

const loginSchema = Joi.object({
  email: Joi.string().email().allow(null, ""),
  phone: Joi.string().min(7).allow(null, ""),
  password: Joi.string().required()
}).or("email", "phone");

exports.login = async (req, res) => {
  try {
    console.log('Login attempt - Body received:', req.body);
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.message);
      return res.status(400).json({ message: error.message, details: "Check that you're sending: email OR phone (required), password (required)" });
    }

    const { email, phone, password } = value;

    const user = await User.findOne({
      where: email ? { email } : { phone }
    });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    console.log('User logged in:', user.id);
    return res.json({ token });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};
