import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcrypt";
import prisma from "@/src/lib/prisma";
import { env } from "@/src/lib/env";

const providers: any[] = [
  Credentials({
    name: "credentials",
    credentials: {
      emailOrPhone: { label: "Email or Phone", type: "text" },
      password: { label: "Password", type: "password" },
    },
    authorize: async (credentials) => {
      if (!credentials?.emailOrPhone || !credentials?.password) {
        return null;
      }

      const input = credentials.emailOrPhone as string;
      const password = credentials.password as string;

      let user = await prisma.user.findFirst({
        where: { email: input },
        include: { organization: true },
      });

      if (!user && /^\+?\d+$/.test(input)) {
        const normalized = input.startsWith("+") ? input : `+234${input.replace(/^0+/, "")}`;
        user = await prisma.user.findFirst({
          where: { phone: normalized },
          include: { organization: true },
        });
      }

      if (!user || !user.passwordHash) {
        return null;
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.phone,
        image: null,
        role: user.role,
        organizationId: user.organizationId,
        orgSlug: user.organization.slug,
      } as any;
    },
  }),
];

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: any = {
  adapter: PrismaAdapter(prisma) as any,
  providers,
  callbacks: {
    async jwt({ token, user, account, profile }: any) {
      if (user) {
        token.role = (user as any).role;
        token.organizationId = (user as any).organizationId;
        token.orgSlug = (user as any).orgSlug;
      }
      if (account?.provider === "google" && profile) {
        token.picture = (profile as any).picture;
      }
      if (token.sub && !token.organizationId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          include: { organization: true },
        });
        if (dbUser && dbUser.organizationId) {
          token.role = dbUser.role;
          token.organizationId = dbUser.organizationId;
          token.orgSlug = dbUser.organization?.slug || "";
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).organizationId = token.organizationId;
        (session.user as any).orgSlug = token.orgSlug;
      }
      return session;
    },
  },
  events: {
    async createUser({ user, account }: any) {
      if (account?.provider === "google") {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            role: "ADMIN",
            accountStatus: "CLAIMED",
            googleId: account.providerAccountId,
          },
        });
      }
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: env.AUTH_SECRET,
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
