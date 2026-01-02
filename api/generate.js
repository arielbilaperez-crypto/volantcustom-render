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
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Health check
  if (req.method === "GET") {
    return res.status(200).json({ status: "API ready" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { options } = req.body;

    const baseImage =
      "https://volantcustom.be/cdn/shop/files/Capture_d_ecran_2025-04-11_a_18.09.55.png";

    const prompt = `
Ultra realistic studio photograph of a BMW F-Series steering wheel.

IMPORTANT:
- Use the provided image as the exact base model.
- Do NOT change the shape, buttons, or proportions.
- Keep original BMW design, steering wheel geometry and layout.
- Only modify materials, colors, stitching, and finish.

Configuration:
${Object.entries(options || {})
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

Add subtle watermark text in the background : "VOLANTCUSTOM.BE"
`;

    const result = await replicate.run(
      "google/imagen-3",
      {
        input: {
          prompt,
          aspect_ratio: "1:1",
          safety_filter_level: "block_only_high"
        }
      }
    );

    // ✅ NORMALISATION DU RÉSULTAT
    let imageUrl = null;

    if (typeof result === "string") {
      imageUrl = result;
    } else if (Array.isArray(result)) {
      imageUrl = result[0];
    } else if (result?.output?.[0]) {
      imageUrl = result.output[0];
    }

    if (!imageUrl || !imageUrl.startsWith("http")) {
      console.error("❌ Invalid image result:", result);
      return res.status(500).json({ error: "Invalid image generated" });
    }

    return res.status(200).json({ image: imageUrl });

  } catch (err) {
    console.error("❌ REPLICATE ERROR:", err);
    return res.status(500).json({
      error: "Image generation failed",
      details: err.message
    });
  }
}
