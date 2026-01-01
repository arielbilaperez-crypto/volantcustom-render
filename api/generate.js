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

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { options } = req.body;

    const prompt = `
Ultra realistic studio photo of a custom car steering wheel.
Compatible with BMW F series, BMW G series, VW Golf 8.
High-end automotive photography.
Clean white background.
Custom configuration:
${Object.entries(options || {})
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

Add subtle watermark text "VOLANTCUSTOM.BE".
`;

    const output = await replicate.run(
      "stability-ai/sdxl:7762fdc6f8b53f1d0d0f9a3f9d92c6b6a8c5c4a89b02c4f83a97e2e16d1b2c66",
      {
        input: {
          prompt,
          width: 1024,
          height: 1024,
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 30
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
