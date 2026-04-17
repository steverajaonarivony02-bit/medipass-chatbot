# MEDIPASS Chatbot (Gemini)

Ce dépôt contient la partie **chatbot** du projet MEDIPASS.  
Il s'agit d'une API Node.js qui expose un endpoint `/api/chat` connecté au modèle Gemini de Google pour assister les patients en langue française.

## Objectif du chatbot

- Répondre aux questions fréquentes des patients (préparation aux examens, prise de sang, etc.).
- Expliquer en langage simple certains termes médicaux ou étapes du parcours (laboratoire, médecin, rendez-vous).
- Aider à s’orienter vers un labo ou un médecin partenaire MEDIPASS.

⚠️ **Limites** :  
Le chatbot **ne pose jamais de diagnostic**, ne prescrit pas de traitement, et rappelle systématiquement qu’il ne remplace pas un professionnel de santé.

---

## Technologies utilisées

- Node.js / Express
- API Gemini (Google Generative AI) via `@google/generative-ai`
- Configuration via fichier `.env`

---

## Installation et lancement

1. Cloner le dépôt :

```bash
git clone https://github.com/steverajaonarivony02-bit/medipass-chatbot.git
cd medipass-chatbot
```

2. Installer les dépendances :

```bash
npm install
```

3. Créer un fichier `.env` à la racine du projet :

```env
GEMINI_API_KEY=VOTRE_CLE_GEMINI_ICI
PORT=3000
```

> La clé Gemini se récupère via **Google AI Studio** (API keys).  
> Cette clé ne doit pas être committée dans Git.

4. Lancer le serveur :

```bash
node server.js
```

Par défaut, l’API écoute sur `http://localhost:3000`.

---

## Endpoints

### `GET /`

Endpoint de test basique :

- Réponse : `MEDIPASS Chatbot API (Gemini) - Hello`

### `POST /api/chat`

Endpoint principal pour dialoguer avec le chatbot.

- URL : `http://localhost:3000/api/chat`
- Méthode : `POST`
- Headers : `Content-Type: application/json`

#### Corps de la requête

```json
{
  "message": "Je dois être à jeun pour ma prise de sang ?"
}
```

`message` : texte saisi par le patient (obligatoire).

#### Exemple de réponse

```json
{
  "sender": "bot",
  "role": "assistant",
  "content": "Bonjour, cela dépend de l'examen médical que vous devez effectuer. En général, pour une prise de sang comme le dosage du sucre ou du cholestérol, il est recommandé de rester à jeun pendant 8 à 12 heures. Vous pouvez boire de l'eau plate, mais évitez toute autre boisson ou nourriture durant cette période. Je vous conseille de confirmer cette consigne auprès de votre médecin ou de contacter un laboratoire partenaire MEDIPASS avant votre rendez-vous.",
  "safety_notice": "Je suis un assistant numérique et je ne remplace pas un médecin. En cas de doute, consulte un professionnel de santé.",
  "created_at": "2026-04-11T10:39:49.505Z"
}
```

---

## Comportement du chatbot (règles principales)

Le prompt système appliqué au modèle Gemini définit les règles suivantes :

- Répond **toujours en français**.
- Utilise un langage simple, adapté à un patient non spécialiste.
- Explique les examens, démarches, résultats de manière générale.
- **Ne donne pas de diagnostic** et ne prescrit pas de traitement.
- Rappelle régulièrement qu’il ne remplace pas un médecin.
- Réponses courtes : 3 à 6 phrases maximum, sans listes à puces.

---

## Tests rapides (script Node)

Un petit script `client-test.js` est fourni pour tester l’API sans interface graphique :

```js
const http = require("http");

const data = JSON.stringify({
  message: "Je dois être à jeun pour ma prise de sang ?"
});

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/api/chat",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = "";

  res.on("data", (chunk) => {
    body += chunk;
  });

  res.on("end", () => {
    console.log("Statut :", res.statusCode);
    console.log("Réponse JSON :");
    console.log(body);
  });
});

req.on("error", (error) => {
  console.error("Erreur requête :", error.message);
});

req.write(data);
req.end();
```

---

## Intégration côté front

Le front (mobile ou web) peut appeler directement `POST /api/chat` avec `fetch` / `axios` ou l’équivalent Flutter :

```js
fetch("http://localhost:3000/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: "Bonjour, j'ai une question..." })
})
  .then((res) => res.json())
  .then((data) => {
    console.log(data.content); // réponse du bot
  });
```