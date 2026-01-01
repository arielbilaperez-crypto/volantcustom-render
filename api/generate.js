import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { options } = req.body;

  const prompt = `
  Ultra realistic studio render of a custom steering wheel.
  Style: premium automotive photography.
  Options:
  ${options}
  Background: clean studio, subtle shadow.
  Include subtle watermark: "volantcustom.be"
  `;

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
