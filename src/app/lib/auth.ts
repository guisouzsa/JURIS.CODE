import "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "./supabase";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      planStatus: string;
      planId: string | null;
    };
  }

  interface User {
    id: string;
    planStatus: string;
    planId: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { data: profile } = await supabaseAdmin
          .from("users")
          .select("id, name, email, password_hash, plan_id, plan_status")
          .eq("email", credentials.email.toLowerCase().trim())
          .maybeSingle();

        if (!profile) return null;

        const isValid = await bcrypt.compare(credentials.password, profile.password_hash);
        if (!isValid) return null;

        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          planId: profile.plan_id,
          planStatus: profile.plan_status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.planId = user.planId;
        token.planStatus = user.planStatus;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.planId = (token.planId as string | null) ?? null;
      session.user.planStatus = token.planStatus as string;
      return session;
    },
  },
};
