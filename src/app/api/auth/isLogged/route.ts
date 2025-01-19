import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

// Clé secrète utilisée pour signer les tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

export async function GET(request: Request) {
  try {

    // Récupérer le token depuis les cookies
    const token = request.headers.get("cookie")?.split("; ").find(c => c.startsWith("authToken="))?.split("=")[1];

    // Si le token est absent, l'utilisateur n'est pas connecté
    if (!token) {
      return new Response(JSON.stringify({ isLogged: false, message: "Utilisateur non connecté." }), {
        status: 401,
      });
    }

    // Vérifier le token avec la clé secrète
    return new Promise((resolve) => {
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
          resolve(new Response(JSON.stringify({ isLogged: false, message: "Token invalide ou expiré." }), {
            status: 401,
          }));
        } else {
          // Si tout est valide, renvoyer une réponse positive
          resolve(new Response(JSON.stringify({
            isLogged: true,
            user: decoded, // Inclure les données utilisateur du token (par exemple, `id` ou `email`)
            message: "Utilisateur connecté.",
          }), {
            status: 200,
          }));
        }
      });
    });
  } catch (error) {
    console.error("Erreur lors de la vérification de la connexion :", error);
    return new Response(JSON.stringify({ isLogged: false, message: "Erreur interne du serveur." }), {
      status: 500,
    });
  }
}
