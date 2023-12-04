import NextAuth, { Account, AuthOptions, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import KeycloakProvider from 'next-auth/providers/keycloak';
import jwt from 'jsonwebtoken';

export const authOptions: AuthOptions = {
  providers: [
    // AzureADProvider({
    //   clientId: process.env.AZURE_AD_CLIENT_ID!,
    //   clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
    //   tenantId: process.env.AZURE_AD_TENANT_ID!,
    // }),

    KeycloakProvider({
      clientId: process.env.AUTH_RESOURCE!,
      clientSecret: process.env.AUTH_SECRET!,
      issuer: `${process.env.AUTH_SERVER_URL}/realms/${process.env.AUTH_RELM}`,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email.toLowerCase(),
          image: null,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },

  // callbacks: {
  // async jwt({ token, account }) {
  //   // IMPORTANT: Persist the access_token to the token right after sign in
  //   if (account) {
  //     token.idToken = account.id_token;
  //   }
  //   return token;
  // },
  // async session({ session, token }) {
  //   session.idToken = token.idToken;
  //   return session;
  // },
  // redirect({ baseUrl }) {
  //   return baseUrl;
  // },
  // },
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

      const decodedToken = jwt.decode(token.accessToken || '') as any;

      token.roles = decodedToken?.resource_access?.['registry-web']?.roles;

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.isAdmin = false;
      session.roles = [];
      session.ministries = {
        admin: [],
        readonly: [],
      };

      // Send properties to the client, like an access_token from a provider.
      if (token) {
        session.accessToken = token.accessToken;
        session.user.roles = token.roles || [];
        session.roles = token.roles || [];

        // Assign the 'user' role to users who log in to the system.
        session.roles.push('user');

        session.roles.forEach((role) => {
          if (role === 'admin') {
            session.isAdmin = true;
            return;
          }

          const regexPattern = /^ministry-(\w+)-(.+)$/;
          const match = regexPattern.exec(role);
          if (match) {
            const ministryCode = match[1];
            const ministryRole = match[2];
            if (!Array.isArray(session.ministries[ministryRole])) session.ministries[ministryCode] = [];
            session.ministries[ministryRole].push(ministryCode);
          }
        });
      }
      // {
      //   ...
      //   roles: ['admin', 'ministry-citz-admin'],
      //   isAdmin: true,
      //   ministries: { admin: ['citz'], readonly: [] },
      // }
      return session;
    },
  },
};
