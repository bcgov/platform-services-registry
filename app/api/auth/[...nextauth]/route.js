import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import jwt from "jsonwebtoken";

export const authOptions = {
  providers: [
    KeycloakProvider({
      // clientId: process.env.KEYCLOAK_ID || "",
      // clientSecret: process.env.KEYCLOAK_SECRET || "",
      // issuer: process.env.KEYCLOAK_ISSUER,
      clientId: process.env.AUTH_RESOURCE || "",
      clientSecret: process.env.AUTH_SECRET || "",
      issuer: `${process.env.AUTH_SERVER_URL}/realms/${process.env.AUTH_RELM}`,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: null, // you can update this if Keycloak provides user image URLs
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account?.access_token;
      }

      // Decode the JWT access token
      const decodedToken = jwt.decode(token.accessToken);

      // Add roles from the decoded token to our token object
      // Note: adjust the path based on where Keycloak stores roles in the JWT
      token.roles = decodedToken?.resource_access?.["registry-web"]?.roles;

      console.log("roles", token.roles);

      return token;
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      session.accessToken = token.accessToken;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
