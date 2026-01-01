export default function handler(req, res) {
  // 🔹 HEADERS CORS (OBLIGATOIRES)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 🔹 Réponse au preflight CORS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 🔹 Sécurité méthode
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 🔹 TEST SIMPLE (sans OpenAI)
    return res.status(200).json({
      image: "https://placehold.co/800x800?text=VolantCustom+Preview"
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
