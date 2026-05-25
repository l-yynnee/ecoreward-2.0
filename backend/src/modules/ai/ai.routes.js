const router = require("express").Router();
const auth = require("../../middlewares/auth");
const requireRole = require("../../middlewares/requireRole");
const { verifyWasteImageForPickup } = require("./ai.controller");

router.post("/verify-waste-image", auth, requireRole("ADMIN"), verifyWasteImageForPickup);

module.exports = router;