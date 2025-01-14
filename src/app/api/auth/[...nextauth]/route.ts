import NextAuth from "next-auth/next"; // Spécifiez explicitement le chemin pour NextAuth
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions); // Passez les options d'authentification

export { handler as GET, handler as POST };
