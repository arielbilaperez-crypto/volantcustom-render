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
  if (req.method === "GET") return res.status(200).json({ status: "API ready" });
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { options } = req.body;

    // 👉 IMAGE DE RÉFÉRENCE (OBLIGATOIRE)
    const baseImage =
      "https://volantcustom.be/cdn/shop/files/Capture_d_ecran_2025-04-11_a_18.09.55.png";

    const prompt = `
Ultra realistic product photo of a custom steering wheel.
Use the provided image as the base reference.
Do NOT change the shape or geometry.
Only change materials and colors.

Requested configuration:
${Object.entries(options || {})
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

Studio lighting, sharp focus, high detail.
`;

    const output = await replicate.run(
      "stability-ai/sdxl",
      {
        input: {
          image: baseImage,
          prompt,
          guidance_scale: 7,
          num_outputs: 1,
        },
      }
    );

    const imageUrl =
      Array.isArray(output) ? output[0] : output?.output?.[0];

    if (!imageUrl) {
      return res.status(500).json({ error: "No image generated" });
    }

    return res.status(200).json({ image: imageUrl });

  } catch (err) {
    console.error("❌ ERROR:", err);
    return res.status(500).json({ error: "Generation failed", details: err.message });
  }
}
