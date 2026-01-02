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

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    return res.status(200).json({ status: "API ready" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { options } = req.body;

    // ⚠️ METS ICI UNE IMAGE RÉELLE DE TON VOLANT (URL PUBLIQUE)
    const baseImage =
      "https://volantcustom.be/cdn/shop/files/Capture_d_ecran_2025-04-11_a_18.09.55.png";

    const prompt = `
Ultra realistic product photo of a premium custom steering wheel.

Use the provided image as the BASE MODEL.
Do NOT change the shape or structure.

Apply ONLY these modifications:
${Object.entries(options || {})
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

Photorealistic studio lighting.
White background.
High-end automotive photography.
`;

    const result = await replicate.run(
      "stability-ai/sdxl",
      {
        input: {
          image: baseImage,
          prompt,
          strength: 0.35, // important : garde la forme originale
          guidance_scale: 7,
          num_outputs: 1,
        },
      }
    );

    // Résultat
    const imageUrl =
      Array.isArray(result) ? result[0] : result?.output?.[0];

    if (!imageUrl) {
      console.error("❌ Invalid output:", result);
      return res.status(500).json({ error: "No image generated" });
    }

    return res.status(200).json({ image: imageUrl });

  } catch (error) {
    console.error("❌ GENERATION ERROR:", error);
    return res.status(500).json({
      error: "Image generation failed",
      details: error.message,
    });
  }
}
