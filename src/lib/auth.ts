import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    GitHub({
      clientId: process.env.Ov23liwrDf6WhbzuyUqB,
      clientSecret: process.env.b48e1c6acf0cde8b51f89829bd88f4020a1a1874,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Fetch isAdmin from DB — not cached in the JWT to avoid stale values
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { isAdmin: true },
        });
        session.user.isAdmin = dbUser?.isAdmin ?? false;
      }
      return session;
    },
  },
});

// Extend next-auth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
