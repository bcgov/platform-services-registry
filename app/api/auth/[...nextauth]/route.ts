import NextAuth, { NextAuthOptions, User, Account } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import jwt from "jsonwebtoken";

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.AUTH_RESOURCE || "",
      clientSecret: process.env.AUTH_SECRET || "",
      issuer: `${process.env.AUTH_SERVER_URL}/realms/${process.env.AUTH_RELM}`,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: null
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }: { token: JWT; account: Account | null }) {
      if (account) {
        token.accessToken = account?.access_token;
      }

      const decodedToken = jwt.decode(token.accessToken || "") as any;

      token.roles = decodedToken?.resource_access?.["registry-web"]?.roles;

      return token;
    },
    async session({
      session,
      token
    }: {
      session: Session;
      token: JWT;
      user: User;
    }) {
      // Send properties to the client, like an access_token from a provider.
      session.accessToken = token.accessToken;
      session.user.roles = token.roles || []; // Adding roles to session.user here
      return session;
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
