export default async function handler(req, res) {
  // 🔓 HEADERS CORS (CRUCIAL)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 🟡 Préflight CORS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 🔴 Méthode non autorisée
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const image = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024"
    });

    res.status(200).json({ image: image.data[0].url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
