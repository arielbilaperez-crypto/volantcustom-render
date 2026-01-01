import OpenAI from "openai";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  // CORS
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
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY missing");
    }

    const { options } = req.body;

    console.log("OPTIONS REÇUES:", options);

    const prompt = `
Ultra realistic studio photo of a custom steering wheel.

Car compatibility:
BMW F series, BMW G series, VW Golf 8.

Configuration:
${Object.entries(options || {})
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

Clean white background.
Soft studio lighting.
Photorealistic render.
Add subtle watermark "VOLANTCUSTOM.BE".
`;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
    });

    return res.status(200).json({
      image: result.data[0].url,
    });

  } catch (error) {
    console.error("🔥 IMAGE GENERATION ERROR:", error);
    return res.status(500).json({
      error: "Image generation failed",
      details: error.message,
    });
  }
}
