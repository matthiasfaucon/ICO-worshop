import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

// Clé secrète utilisée pour signer les tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Vérifier que la méthode HTTP est `GET`
  if (req.method !== "GET") {
    return res
      .status(405)
      .setHeader("Allow", ["GET"])
      .json({ message: "Méthode non autorisée." });
  }

  try {
    // Récupérer le token depuis les cookies
    const token = req.cookies.authToken;

    // Si le token est absent, l'utilisateur n'est pas connecté
    if (!token) {
      return res
        .status(401)
        .json({ isLogged: false, message: "Utilisateur non connecté." });
    }

    // Vérifier le token avec la clé secrète
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ isLogged: false, message: "Token invalide ou expiré." });
      }

      // Si tout est valide, renvoyer une réponse positive
      res.status(200).json({
        isLogged: true,
        user: decoded, // Inclure les données utilisateur du token (par exemple, `id` ou `email`)
        message: "Utilisateur connecté.",
      });
    });
  } catch (error) {
    console.error("Erreur lors de la vérification de la connexion :", error);
    res
      .status(500)
      .json({ isLogged: false, message: "Erreur interne du serveur." });
  }
}
