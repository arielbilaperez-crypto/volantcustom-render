import OpenAI from "openai";

export const config = {
  api: {
    bodyParser: true,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // 🔥 HEADERS CORS OBLIGATOIRES
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // 🔥 Réponse immédiate au preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { product, options } = req.body;

    console.log("OPTIONS REÇUES :", options);

    const prompt = `
Ultra realistic studio photo of a custom car steering wheel.

Compatible with BMW F Series, BMW G Series and VW Golf 8.
High quality professional studio lighting.
Clean white background.

Customization details:
${Object.entries(options || {})
  .map(([key, val]) => `- ${key}: ${val}`)
  .join("\n")}

Add a subtle watermark text "VOLANTCUSTOM.BE" at the bottom.
No hands. No car interior. Only the steering wheel.
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
    console.error("❌ IMAGE GENERATION ERROR:", err);
    return res.status(500).json({ error: "Image generation failed" });
  }
}
