import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "./lib/auth"; // Assurez-vous que cette fonction est correcte
import { v4 as uuidv4 } from "uuid";

export function middleware(req: NextRequest) {
  const protectedRoutes = ["/api/protected", "/dashboard"];
  const pathname = req.nextUrl.pathname;

  // Vérifie si la route est protégée
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    console.log("Route protégée détectée :", pathname);

    // Récupère le token dans les cookies ou l'en-tête Authorization
    let token = req.cookies.get("authToken")?.value;

    if (!token) {
      const authHeader = req.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1]; // Récupère le token après "Bearer"
      }
    }

    if (!token) {
      console.log("Aucun token trouvé dans les cookies ou l'en-tête Authorization.");
      const loginUrl = new URL("/signin", req.url);
      console.log("Redirection vers la page de connexion :", loginUrl.toString());
      return NextResponse.redirect(loginUrl);
    }

    console.log("Token trouvé :", token);

    try {
      const decoded = validateToken(token); // Valide le token JWT
      console.log("Token validé avec succès :", decoded);

      // Injecte les informations utilisateur décodées dans les en-têtes
      req.headers.set("user", JSON.stringify(decoded));
      return NextResponse.next();
    } catch (error) {
      console.error("Erreur de validation du token :", error);
      const loginUrl = new URL("/signin", req.url);
      console.log("Redirection vers la page de connexion en raison d'un token invalide ou expiré :", loginUrl.toString());
      return NextResponse.redirect(loginUrl);
    }
  }

  console.log("Route non protégée :", pathname);

  // Gestion des visiteurs anonymes avec un `session_uuid`
  let session_uuid = req.cookies.get("session_uuid")?.value;

  if (!session_uuid) {
    // Générer un nouveau `session_uuid`
    session_uuid = uuidv4();
    console.log("Génération d'un nouveau session_uuid :", session_uuid);

    // Ajouter le cookie `session_uuid`
    const response = NextResponse.next();
    response.cookies.set("session_uuid", session_uuid, {
      maxAge: 365 * 24 * 60 * 60, // 1 an en secondes
      httpOnly: true, // Empêche l'accès via le client JS
      secure: process.env.NODE_ENV === "production", // Utiliser HTTPS en production
      path: "/",
    });

    return response;
  } else {
    console.log("Session ID trouvé :", session_uuid);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/dashboard"], // Ajout des routes protégées
};
