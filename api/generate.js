import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { product, options } = req.body;

    const prompt = `
Ultra realistic studio render of a custom car steering wheel.

Compatible with BMW F series, BMW G series and VW Golf 8.
High-end automotive photography style.
Clean white studio background.
Soft professional lighting.
Photorealistic 3D render.

Customization:
- Material: ${options.material || "Alcantara"}
- Stitching color: ${options.stitching || "black"}
- Carbon fiber: ${options.carbon || "no"}
- Shape: ${options.shape || "sport flat bottom"}

Add a subtle watermark text "VOLANTCUSTOM.BE" in the lower area.
No car interior, no hands, only the steering wheel.
`;

    const image = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      quality: "high"
    });

    return res.status(200).json({
      image: image.data[0].url
    });

  } catch (err) {
    console.error("GEN ERROR", err);
    res.status(500).json({ error: "Image generation failed" });
  }
}
