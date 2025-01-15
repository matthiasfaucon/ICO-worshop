import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email et mot de passe",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe sont requis.");
        }

        try {
          // Recherche de l'utilisateur par email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) {
            throw new Error("Utilisateur non trouvé ou mot de passe incorrect.");
          }

          // Validation du mot de passe
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            throw new Error("Mot de passe incorrect.");
          }

          // Retourne les données utilisateur si valide
          return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            session_uuid: user.session_uuid,
          };
        } catch (error) {
          console.error("Erreur lors de la connexion :", error);
          throw new Error("Erreur interne du serveur.");
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          username: token.username as string,
          email: token.email as string,
          role: token.role as string,
          session_uuid: token.session_uuid as string,
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.role = user.role;
        token.session_uuid = user.session_uuid;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret",
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/connexion",
    signOut: "/deconnexion",
    error: "/erreur",
    verifyRequest: "/verification",
    newUser: "/nouveau-compte",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
