import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    session_uuid?: string; // UUID lié à la session
  }

  interface Session {
    user: {
      id: string;
      uuid?: string;
    };
  }
}
