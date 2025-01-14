import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "./lib/auth"; // Assurez-vous que validateToken est correct

export function middleware(req: NextRequest) {
  console.log("Requête entrante :", {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers),
  });

  const protectedRoutes = ["/api/protected", "/dashboard"];
  const pathname = req.nextUrl.pathname;

  console.log("Vérification du chemin :", pathname);

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
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/dashboard"], // Ajout des routes protégées
};
