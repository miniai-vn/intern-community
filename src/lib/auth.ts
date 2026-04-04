import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      authorization: { params: { prompt: "select_account" } },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {//user là thông tin người dùng sau khi đăng nhập thành công, account chứa thông tin về provider, profile chứa thông tin từ provider
      
      const dbUser = await db.user.findUnique({ where: { id: user.id },select: { isLocked: true }   });
      if(dbUser?.isLocked) {
        return false; // 
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Fetch isAdmin from DB — not cached in the JWT to avoid stale values
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { isAdmin: true, isLocked: true },
        });
        if(dbUser?.isLocked) {
          return null as any; 
        }
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
