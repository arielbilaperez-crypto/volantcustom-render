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

  // ✅ PRE-FLIGHT CORS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ AUTORISER GET POUR TEST / STATUS
  if (req.method === "GET") {
    return res.status(200).json({
      status: "API ready",
      message: "Use POST to generate image"
    });
  }

  // ❌ Bloquer le reste
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { options } = req.body;

    const prompt = `
Ultra realistic studio photo of a premium custom steering wheel.
Compatible with BMW / VW vehicles.
Clean white background.

Configuration:
${Object.entries(options || {})
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

Add subtle watermark text: "VOLANTCUSTOM.BE"
`;

  const result = await replicate.run(
  "google/imagen-3",
  {
    input: {
      prompt,
      aspect_ratio: "1:1",
      safety_filter_level: "block_only_high",
    }
  }
);

// 🔍 DEBUG LOG (important)
console.log("REPLICATE RAW OUTPUT:", JSON.stringify(result, null, 2));

// 🔎 Extraction intelligente de l’image
let imageUrl = null;

if (Array.isArray(result)) {
  imageUrl = typeof result[0] === "string" ? result[0] : result[0]?.url;
} else if (result?.output?.[0]) {
  imageUrl = result.output[0];
}

if (!imageUrl) {
  return res.status(500).json({
    error: "No image returned by Replicate",
    raw: result
  });
}

return res.status(200).json({
  image: imageUrl
});
