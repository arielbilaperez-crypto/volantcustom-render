import Replicate from "replicate";

export const config = {
  api: {
    bodyParser: true,
  },
};

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// 🔧 utilitaire : URL → base64
async function imageUrlToBase64(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch base image");
  }
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

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
      "https://volantcustom.be/cdn/shop/files/IMG-5840.png?v=1766947067&width=1346";

    // 🔥 conversion base64 (OBLIGATOIRE pour Nano Banana)
    const base64Image = await imageUrlToBase64(baseImage);

    // 🔒 prompt verrouillé configurateur
    const prompt = `
The provided image is the exact visual and structural reference.
Preserve steering wheel geometry, proportions, layout and structure.
Do NOT redesign or reimagine the object.
Only modify materials, colors, stitching and finishes.

Configuration:
${Object.entries(options || {})
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

Add a subtle "VOLANTCUSTOM.BE" watermark in the background.
`;

    // 🚀 appel Replicate avec format Gemini natif
    const result = await replicate.run(
      "gemini-2.5-flash-image",
      {
        input: {
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: "image/png",
                    data: base64Image,
                  },
                },
              ],
            },
          ],
        },
      }
    );

    // 🧹 normalisation résultat image
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
      details: err.message,
    });
  }
}
