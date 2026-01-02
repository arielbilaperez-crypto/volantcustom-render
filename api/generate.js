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

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({ status: "API ready" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { options } = req.body;

    // ⚠️ IMAGE DE RÉFÉRENCE (OBLIGATOIRE)
    const baseImage =
      "https://volantcustom.be/cdn/shop/files/Capture_d_ecran_2025-04-11_a_18.09.55.png";

    const prompt = `
High-quality studio photograph of a premium car steering wheel.
Use the provided image as the exact base reference.
Do NOT change the shape or proportions.

Customizations:
${Object.entries(options || {})
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

Ultra realistic lighting, studio quality.
`;

    const output = await replicate.run(
      "stability-ai/sdxl:4e3a7b7b6b2f13f0fd4e6f9c2b7a9b68e7fd8d94f8bbdbfcb4a56e5e5a7e4b1b",
      {
        input: {
          prompt,
          image: baseImage,
          strength: 0.4,
          num_outputs: 1,
          guidance_scale: 7,
        },
      }
    );

    const imageUrl =
      Array.isArray(output) ? output[0] : output?.output?.[0];

    if (!imageUrl) {
      console.error("❌ Invalid output:", output);
      return res.status(500).json({ error: "No image generated" });
    }

    return res.status(200).json({ image: imageUrl });

  } catch (err) {
    console.error("❌ GENERATION ERROR:", err);
    return res.status(500).json({
      error: "Image generation failed",
      details: err.message,
    });
  }
}
