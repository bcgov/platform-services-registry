// import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import { PrismaClient } from "@prisma/client";
// import KeycloakProvider from "next-auth/providers/keycloak";

// const prisma = new PrismaClient();

// const handler = NextAuth({
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     KeycloakProvider({
//       clientId: process.env.AUTH_RESOURCE!,
//       clientSecret: process.env.AUTH_SECRET!,
//       issuer: `${process.env.AUTH_SERVER_URL}/realms/${process.env.AUTH_RELM}`,
//       profile(profile) {
//         return {
//           id: profile.sub,
//           name: profile.name,
//           email: profile.email,
//           image: null,
//         };
//       },
//     }),
//   ],
// });

// export { handler as GET, handler as POST };


import NextAuth, { User, Account } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import jwt from "jsonwebtoken";

const prismaAdapter = PrismaAdapter(prisma);

const MyAdapter = {
  ...prismaAdapter,
  linkAccount: (account: any) => {
    account["not_before_policy"] = account["not-before-policy"];
    delete account["not-before-policy"];
    return prismaAdapter.linkAccount(account);
  },
};

export const authOptions = {
  adapter: MyAdapter,
  providers: [
    KeycloakProvider({
      clientId: process.env.AUTH_RESOURCE!,
      clientSecret: process.env.AUTH_SECRET!,
      issuer: `${process.env.AUTH_SERVER_URL}/realms/${process.env.AUTH_RELM}`,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: null,
        };
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,

  // pages: {
  //   signIn: "/auth/signin",
  //   signOut: "/auth/signout",
  //   error: "/auth/error", // Error code passed in query string as ?error=
  //   verifyRequest: "/auth/verify-request", // (used for check email message)
  //   newUser: "/auth/new-user" // New users will be directed here on first sign in (leave the property out if not of interest)
  // },
  // pages: {
  //   signIn: '/api/auth/signin',
  //   error: '/api/auth/error',
  // },
  callbacks: {
    async jwt({ token, account }: { token: JWT; account: Account | null }) {
      if (account) {
        token.accessToken = account?.access_token;
      }

      const decodedToken = jwt.decode(token.accessToken || "") as any;

      token.roles = decodedToken?.resource_access?.["registry-web"]?.roles;

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Send properties to the client, like an access_token from a provider.
      if (token) {
        session.accessToken = token.accessToken;
        session.user.roles = token.roles || []; // Adding roles to session.user here
      }

      return session;
    },
  },
};

// @ts-ignore
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
