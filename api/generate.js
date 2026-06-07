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
        "https://res.cloudinary.com/dssr4em6b/image/upload/v1780792645/IMG-5968_rhz4ma.webp";
      vehiclePrompt =
        "Volkswagen Golf 8 GTI / R steering wheel, modern sporty design";
    }
    if (vehicle === "golf7") {
      baseImage =
        "https://res.cloudinary.com/dssr4em6b/image/upload/v1780792223/golf7_vcbcover_1_nzywwl.webp";
      vehiclePrompt =
        "Volkswagen Golf 7 GTI / R steering wheel, modern sporty design";
    }
    if (vehicle === "bmw_f") {
      baseImage =
        "https://res.cloudinary.com/dssr4em6b/image/upload/Capture_d_ecran_2025-04-11_a_18.09.55_tifqye";
      vehiclePrompt =
        "BMW F-Series M Sport steering wheel (F20, F30, F32), OEM sporty design";
    }
    if (vehicle === "bmw_g") {
  baseImage =
    "https://res.cloudinary.com/dssr4em6b/image/upload/v1780792700/bmwgseries_vcbcover_mvmefo.webp";
  vehiclePrompt =
    "BMW G-Series M Sport steering wheel (G20, G30, G42), modern OEM design";
    }
    if (vehicle === "bmw_g_lci") {
  baseImage =
    "https://res.cloudinary.com/dssr4em6b/image/upload/v1780792475/FullSizeRender_adf856b6-a07c-42f5-a017-fe24d2a977c5_rj167p.webp";
  vehiclePrompt =
    "BMW G-Series Facelift 2025 M Sport steering wheel (G20 LCI, G80 LCI), modern OEM design";
    }
    if (vehicle === "audi_8v1") {
  baseImage =
    "https://res.cloudinary.com/dssr4em6b/image/upload/v1780792874/audi_oldgen_vcbcover_1_lhg3pc.webp";
  vehiclePrompt =
    "Audi 8V1 (A3/S3/RS3) steering wheel, modern OEM design";
    }
    if (vehicle === "audi_8v2") {
  baseImage =
    "https://res.cloudinary.com/dssr4em6b/image/upload/v1780792757/96169F12-4407-4613-83CD-14A1E6C59266_pqqbpq.webp";
  vehiclePrompt =
    "Audi 8V2 (A3/A4/A5/S3/S5/RS3) steering wheel, modern OEM design";
    }
    if (vehicle === "audi_8y") {
  baseImage =
    "https://res.cloudinary.com/dssr4em6b/image/upload/v1780793047/audiB9.5_vcbcover_xay9tt.webp";
  vehiclePrompt =
    "Audi 8Y B9.5 (A3/A4/A5/RS3 8Y) steering wheel, modern OEM design";
    }
    if (vehicle === "audi_rs6") {
  baseImage =
    "https://res.cloudinary.com/dssr4em6b/image/upload/v1780793302/audirs6c8_vcbcover_1_f0vsuy.webp";
  vehiclePrompt =
    "Audi (RS6/A7/RS7 C8) steering wheel, modern OEM design";
    }
    if (vehicle === "audi_r8") {
  baseImage =
    "https://res.cloudinary.com/dssr4em6b/image/upload/v1780793189/audirs38v2_vcbcover_uprzmj.webp";
  vehiclePrompt =
    "Audi 8V2 (TT/TTRS/R8) steering wheel, modern OEM design";
    }
    if (vehicle === "mb_sport") {
  baseImage =
    "https://res.cloudinary.com/dssr4em6b/image/upload/v1780792958/mercedes2015_vcbcover_1_samqnz.webp";
  vehiclePrompt =
    "Mercedes AMG Performance 2010-2014 (C63 W204/ E63 W212) steering wheel, modern OEM design";
    }
    if (vehicle === "mb_super") {
  baseImage =
    "https://res.cloudinary.com/dssr4em6b/image/upload/v1780792813/mercedesamg2018_vcbcover_1_gjjusi.webp";
  vehiclePrompt =
    "Mercedes AMG Sport 2014-2019 (C/E/SL/CL/CLS/GLC/AMG GT) steering wheel, modern OEM design";
    }
    if (vehicle === "mb_ultra") {
  baseImage =
    "https://res.cloudinary.com/dssr4em6b/image/upload/v1780793125/vcb_mercedesamg2023_fullwhite_1_tx35rw.webp";
  vehiclePrompt =
    "Mercedes AMG Sport 2020-2024 (W206, W213) steering wheel, modern OEM design";
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
