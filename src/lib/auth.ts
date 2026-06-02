import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

type DemoSessionUser = {
  id?: string;
  role?: string | null;
};

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Active Mirror Demo",
      credentials: {
        role: { label: "Role", type: "text", placeholder: "demo" },
      },
      async authorize(credentials) {
        const requestedRole = String(credentials?.role || "demo").toUpperCase();
        const role = requestedRole === "SUBSCRIBER" ? "PUBLIC_DEMO" : "PUBLIC_DEMO";

        let user = await prisma.user.findFirst({
          where: { email: "demo@activemirror.ai" }
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: "demo@activemirror.ai",
              name: "Active Mirror Demo",
              role: role,
            }
          });
        } else if (user.role !== role) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { role },
          });
        }
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const demoUser = user as typeof user & DemoSessionUser;
        token.role = demoUser.role;
        token.id = demoUser.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const sessionUser = session.user as typeof session.user & DemoSessionUser;
        sessionUser.role = typeof token.role === "string" ? token.role : null;
        if (typeof token.id === "string") sessionUser.id = token.id;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
