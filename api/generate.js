export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    return res.status(200).json({ status: "API ready" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 👇 TA LOGIQUE DE GÉNÉRATION ICI
}

import Replicate from "replicate";

export const config = {
  api: {
    bodyParser: true,
  },
};

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { options } = req.body;

    const prompt = `
Ultra realistic studio photo of a premium custom steering wheel.
Compatible with BMW / VW vehicles.
Clean white background.
High-end product photography.

Configuration:
${Object.entries(options || {})
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

Add subtle watermark text: "VOLANTCUSTOM.BE"
`;

    const output = await replicate.run(
      "google/imagen-3",
      {
        input: {
          prompt,
          aspect_ratio: "1:1",
          safety_filter_level: "block_only_high",
          negative_prompt: "low quality, blurry, watermark, text, logo",
        }
      }
    );

    return res.status(200).json({
      image: output[0]
    });

  } catch (error) {
    console.error("❌ REPLICATE ERROR:", error);
    return res.status(500).json({
      error: "Image generation failed",
      details: error.message
    });
  }
}
