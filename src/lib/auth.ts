import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Mock Authentication",
      credentials: {
        role: { label: "Role (admin or public)", type: "text", placeholder: "admin" },
      },
      async authorize(credentials) {
        const role = String(credentials?.role || "public").toUpperCase();
        
        let user = await prisma.user.findFirst({
          where: { email: `${role.toLowerCase()}@swfi.com` }
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: `${role.toLowerCase()}@swfi.com`,
              name: `${role} User`,
              role: role,
            }
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
