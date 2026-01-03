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
      "https://volantcustom.be/cdn/shop/files/Capture_d_ecran_2025-04-11_a_18.09.55.png";

    const prompt = `dio photograph of a custom steering wheel.

REFERENCE MODEL:
- Use the provided BMW F-Series steering wheel image as the exact geometric reference.
- Do NOT modify the steering wheel shape, proportions, buttons layout, or structure.
- The reference image defines the exact placement and size of all components.

STEERING WHEEL COMPONENT DEFINITIONS (IMPORTANT):
The steering wheel is composed of the following clearly identified elements.
Only these elements may be customized.

1. GRIP (outer circular ring):
- The full external circular part of the steering wheel.
- Includes leather or Alcantara surface, stitching color and pattern.
- Shape, thickness and ergonomics must remain identical to the reference image.

2. CENTRAL AIRBAG COVER:
- The round central part containing the car logo.
- Only material, texture or color may be changed.
- The car logo must remain centered and unchanged in size and position.

3. PADDLE SHIFTERS:
- The two rear paddles behind the steering wheel.
- Marked with "+" on the right and "-" on the left.
- Only material, color or finish may vary.

4. CENTRAL LOWER TRIM (GARNITURE CENTRALE):
- The V-shaped lower structural trim below the airbag.
- This part is a glossy carbon fiber element in the reference image.
- Geometry must remain strictly identical.

5. CENTRAL INSERT:
- The thin V-shaped insert embedded inside the central lower trim.
- This is the colored accent piece (blue in the reference image).
- Only color and finish may change.

6. LOWER LOGO:
- The logo located at the bottom of the steering wheel.
- In the reference image, it is "M Performance".
- Replace or customize this logo according to OPTIONS DETECTED.

CUSTOMIZATION RULES:
- Keep original BMW F-Series steering wheel geometry at all times.
- Only modify materials, colors, stitching, textures and finishes.
- Do not add or remove components.
- Do not redesign buttons, spokes or layout.

VISUAL STYLE:
- Ultra-realistic studio lighting.
- High-detail textures (leather grain, Alcantara fibers, carbon weave).
- Photorealistic reflections and shadows.

BRANDING:
- Include a subtle "VOLANTCUSTOM.BE" watermark in the studio background.

BACKGROUND:
- Display an ultra-realistic render of the selected or detected BMW F-Series car model in the background, next to the steering wheel.
- Background must remain secondary and not distract from the steering wheel.

FINAL OUTPUT:
- One centered, front-facing steering wheel.
- Clean studio composition.
- Maximum realism, suitable for premium automotive customization visualization.
`;

Configuration:
${Object.entries(options || {})
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

Add subtle watermark text in the background : "VOLANTCUSTOM.BE"
`;

      const result = await replicate.run(
      "google/nano-banana",
      {
        input: {
          prompt,
          aspect_ratio: "1:1",
          safety_filter_level: "block_only_high"
        }
      }
    );

    // ✅ NORMALISATION DU RÉSULTAT
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
      details: err.message
    });
  }
}
