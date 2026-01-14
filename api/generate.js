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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { options, vehicle } = req.body;

    // 🔹 Choix image de référence selon le configurateur
    let baseImage = null;
    let vehiclePrompt = "";

    if (vehicle === "golf8") {
      baseImage =
        "https://volantcustom.be/cdn/shop/files/IMG-5968.png?v=1767471751&width=990";
      vehiclePrompt =
        "Volkswagen Golf 8 GTI / R steering wheel, modern sporty design";
    }
    if (vehicle === "golf7") {
      baseImage =
        "https://volantcustom.be/cdn/shop/files/golf7_vcbcover.jpg?v=1768431701&width=990";
      vehiclePrompt =
        "Volkswagen Golf 7 GTI / R steering wheel, modern sporty design";
    }

    if (vehicle === "bmw_f") {
      baseImage =
        "https://volantcustom.be/cdn/shop/files/Capture_d_ecran_2025-04-11_a_18.09.55.png?v=1766946287&width=990";
      vehiclePrompt =
        "BMW F-Series M Sport steering wheel (F20, F30, F32), OEM sporty design";
    }
    if (vehicle === "bmw_g") {
  baseImage =
    "https://volantcustom.be/cdn/shop/files/bmwgseries_vcbcover.jpg?v=1766945763&width=990";
  vehiclePrompt =
    "BMW G-Series M Sport steering wheel (G20, G30, G42), modern OEM design";
    }

    const prompt = `
Ultra realistic studio photograph of a ${vehiclePrompt}.

IMPORTANT:
- Use the provided image as visual reference
- Keep original steering wheel shape and button layout
- No fantasy or concept design
- Only adapt materials, colors, stitching and finishes

Configuration:
${Object.entries(options || {})
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

White studio background.
Professional automotive product photography.
Subtle "VOLANTCUSTOM.BE" watermark in the background.
`;

    const result = await replicate.run(
      "google/nano-banana",
      {
        input: {
          prompt,
          image_input: baseImage ? [baseImage] : undefined,
          aspect_ratio: "1:1",
          safety_filter_level: "block_only_high"
        }
      }
    );

    let imageUrl = null;
    if (typeof result === "string") imageUrl = result;
    else if (Array.isArray(result)) imageUrl = result[0];
    else if (result?.output?.[0]) imageUrl = result.output[0];

    if (!imageUrl || !imageUrl.startsWith("http")) {
      console.error("❌ Invalid image result:", result);
      return res.status(500).json({ error: "Invalid image generated" });
    }

    return res.status(200).json({ image: imageUrl });

  } catch (err) {
    console.error("❌ REPLICATE ERROR:", err);
    return res.status(500).json({
      error: "Image generation failed",
      details: err.message
    });
  }
}
