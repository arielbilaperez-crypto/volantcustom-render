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
    // ✅ TEST SIMPLE POUR VALIDER LE PIPELINE
    return res.status(200).json({
      image: "https://placehold.co/900x900?text=VCB+Preview+OK"
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
