import jwt from "jsonwebtoken";
import Router from "next/router";
import { v4 as uuidv4 } from "uuid";

const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * Options d'authentification NextAuth
 */
export const authOptions = {
  providers: [
    // Exemple d'autres providers comme Google ou Credentials
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.session_uuid = user.session_uuid;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.user.id = token.id;
      session.user.uuid = token.session_uuid;
      return session;
    },
  },
  jwt: {
    secret: JWT_SECRET,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signin",
    error: "/error",
  },
};

/**
 * Valide un token JWT.
 * @param token - Le token JWT à valider.
 * @returns Les données décodées du token si valide.
 * @throws Une erreur si le token est invalide ou expiré.
 */
export function validateToken(token: string) {
  if (!token || typeof token !== "string") {
    console.error("Token manquant.");
    window.location.href = "/auth-options";
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("Erreur lors de la validation du token :", error);
    window.location.href = "/auth-options";
  }
}