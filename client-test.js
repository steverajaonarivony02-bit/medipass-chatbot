// client-test.js : petit script pour tester POST /api/chat

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