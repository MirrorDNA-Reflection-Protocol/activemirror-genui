import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

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
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
