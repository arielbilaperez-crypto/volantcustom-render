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
Ultra realistic studio photo of a custom steering wheel.
BMW / VW compatible.
High-end automotive photography.
Clean white background.

Customization:
${Object.entries(options || {})
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

Add a subtle watermark: VOLANTCUSTOM.BE
`;

    // 🔥 OFFICIAL SDXL MODEL (WORKING)
    const prediction = await replicate.predictions.create({
      version: "stability-ai/sdxl",
      input: {
        prompt,
        width: 1024,
        height: 1024,
        num_outputs: 1,
        guidance_scale: 7.5,
        num_inference_steps: 30
      }
    });

    // Attendre la génération
    let result = prediction;
    while (result.status !== "succeeded" && result.status !== "failed") {
      await new Promise(r => setTimeout(r, 1500));
      result = await replicate.predictions.get(result.id);
    }

    if (result.status === "failed") {
      throw new Error("Generation failed");
    }

    return res.status(200).json({
      image: result.output[0]
    });

  } catch (err) {
    console.error("REPLICATE ERROR:", err);
    return res.status(500).json({
      error: "Image generation failed",
      detail: err.message
    });
  }
}
