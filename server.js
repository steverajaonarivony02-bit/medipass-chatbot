require("dotenv").config();
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());

// Initialisation du client Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let genAI = null;
let model = null;

if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  // Nom de modèle trouvé dans la doc officielle Gemini
  model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
}

// Route GET simple pour tester
app.get("/", (req, res) => {
  res.send("MEDIPASS Chatbot API (Gemini) - Hello");
});

// Route POST /api/chat
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res
      .status(400)
      .json({ error: "Le champ 'message' est obligatoire." });
  }

  // Si pas de clé, mode démo sans IA
  if (!GEMINI_API_KEY || !model) {
    return res.json({
      sender: "bot",
      role: "assistant",
      content:
        "Je suis un chatbot MEDIPASS en mode démo (aucune clé Gemini configurée). Je ne peux pas encore répondre de façon intelligente.",
      safety_notice:
        "Je suis un assistant numérique de test et je ne remplace pas un médecin.",
      created_at: new Date().toISOString()
    });
  }

  // Prompt système : règles du bot
  const systemPrompt =
    "Tu es MEDIPASS, un assistant de santé numérique pour Madagascar. " +
    "Tu réponds toujours en français, avec un langage simple et clair, pour un patient non spécialiste. " +
    "Rôle : expliquer des examens, résultats, démarches, et aider à s’orienter (vers labo, médecin, rendez-vous). " +
    "Tu ne poses JAMAIS de diagnostic médical, tu ne prescris pas de traitement et tu n'interprètes pas précisément les résultats chiffrés. " +
    "Tu donnes des conseils généraux (préparation à un examen, explications simples des termes médicaux, étapes administratives). " +
    "Tu ajoutes régulièrement un rappel que tu ne remplaces pas un médecin et qu’il faut consulter un professionnel de santé en cas de doute. " +
    "Tes réponses font entre 3 et 6 phrases maximum, sans liste à puces.";

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: systemPrompt },
            { text: `Question du patient : ${message}` }
          ]
        }
      ]
    });

    const responseText =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Désolé, je n'ai pas pu générer de réponse pour le moment.";

    res.json({
      sender: "bot",
      role: "assistant",
      content: responseText.trim(),
      safety_notice:
        "Je suis un assistant numérique et je ne remplace pas un médecin. En cas de doute, consulte un professionnel de santé.",
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erreur Gemini :", error);
    res.status(500).json({
      error: "Erreur lors de l'appel à l'API Gemini"
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `MEDIPASS Chatbot API (Gemini) running on http://localhost:${PORT}`
  );
});