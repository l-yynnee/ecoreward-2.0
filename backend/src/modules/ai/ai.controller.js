const Joi = require("joi");
const { Pickup, ImageVerificationLog} = require("../../../models");
const aiClient  = require("../../services/aiClient");

const verifySchema = Joi.object({
  pickup_id: Joi.number().integer().positive().required(),
  declared_waste_type: Joi.string().optional()
});

exports.verifyWasteImageForPickup = async (req, res) => {
  try {
    const { error, value } = verifySchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const pickup = await Pickup.findByPk(value.pickup_id);
    if (!pickup) return res.status(404).json({ message: "Pickup not found" });

    if (!pickup.image_url) {
      return res.status(400).json({ message: "Pickup has no image_url to verify" });
    }

    // Prefer declared type from request; fallback to pickup.waste_type
    const declared = value.declared_waste_type || pickup.waste_type;

    const result = await aiClient.verifyWasteImage({
        
      image_url: pickup.image_url,
      declared_waste_type: declared
    });
    if (!result) {
    return res.status(502).json({ message: "AI verification returned no result" });
    }

    // Expect DS response: predicted_material, confidence (0–1), is_match, notes
    const predicted = result.predicted_material || null;
    const confidence01 = result.confidence ?? null;
    const confidence100 = confidence01 !== null ? Number((Number(confidence01) * 100).toFixed(2)) : null;

    const is_match = result.is_match ?? null;
    const notes = result.notes || null;

    const threshold = 60; // MVP threshold: <60% => review
const shouldFlag = (is_match === false) || (confidence100 !== null && confidence100 < threshold);

const reasonParts = [];
if (is_match === false) reasonParts.push("Image does not match declared waste type");
if (confidence100 !== null && confidence100 < threshold) reasonParts.push(`Low verification confidence (${confidence100}%)`);

const review_reason = shouldFlag ? reasonParts.join("; ") : null;

    await pickup.update({
      image_verification_label: predicted,
      image_verification_score: confidence100,
      image_verified: is_match,
      image_verification_notes: notes,
        needs_review: shouldFlag,
        review_reason
    });

    return res.json({
      pickup_id: pickup.id,
      image_url: pickup.image_url,
      declared_waste_type: declared,
      predicted_material: predicted,
      confidence: confidence100,
      is_match,
      notes,
      mode: process.env.AI_MODE || "mock",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};