const router = require('express').Router();
const auth = require("../../middlewares/auth");

const tips = [
    "Use reusable bags instead of single-use plastic bags.",
    "Rinse out containers before recycling to prevent contamination.",
    "Flatten cardboard boxes to save space in recycling bins.",
    "Keep hazardous materials like batteries and electronics out of the trash.",
    "Compost food scraps to reduce landfill waste.",
    "Recycle paper, plastic, glass, and metal properly.",
];

router.get("/today", auth, (req, res) => {
    const idx = new Date().getDate() % tips.length;
    res.json({ tip: tips[idx] });
});

module.exports = router;

