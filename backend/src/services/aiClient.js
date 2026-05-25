const axios = require("axios");

const timeoutMs = 8000;

exports.verifyWasteImage = async ({ image_url, declared_waste_type }) => {
  const mode = process.env.AI_MODE || "mock";

  // ✅ Demo-safe mock mode
  if (mode === "mock") {
    const predicted_material = declared_waste_type || "Plastic";
    const confidence = 0.86; // 0–1
    return {
      predicted_material,
      confidence,
      is_match: true,
      notes: "Mock verification (demo mode)."
    };
  }

  // ✅ Live mode (DS REST API)
  const base = process.env.AI_BASE_URL;
  const apiKey = process.env.AI_API_KEY;

  if (!base) throw new Error("AI_BASE_URL is missing in .env");
    if (!apiKey) throw new Error("AI_API_KEY is missing in .env");

  const res = await axios.post(
    `${base}/verify-waste-image`,
    { image_url, declared_waste_type },
    {
      timeout: timeoutMs,
      headers: { "x-api-key": apiKey }
    }
  );

  if (!res || !res.data) {
    throw new Error("No response data from AI service");
  }

  return res.data;
};