import NextAuth, { Account, AuthOptions, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import KeycloakProvider from 'next-auth/providers/keycloak';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { getUser } from '@/msal/service';
import { IS_PROD, AUTH_SERVER_URL, AUTH_RELM, AUTH_RESOURCE, AUTH_SECRET } from '@/config';
import { parseMinistryFromDisplayName } from '@/components/utils/parseMinistryFromDisplayName';

interface KeycloakToken {
  exp: number;
  iat: number;
  auth_time: number;
  jti: string;
  iss: string;
  aud: string;
  sub: string;
  typ: string;
  azp: string;
  session_state: string;
  at_hash: string;
  acr: string;
  sid: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
}

export const authOptions: AuthOptions = {
  providers: [
    // AzureADProvider({
    //   clientId: process.env.AZURE_AD_CLIENT_ID!,
    //   clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
    //   tenantId: process.env.AZURE_AD_TENANT_ID!,
    // }),

    KeycloakProvider({
      clientId: AUTH_RESOURCE!,
      clientSecret: AUTH_SECRET!,
      issuer: `${AUTH_SERVER_URL}/realms/${AUTH_RELM}`,
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
  secret: AUTH_SECRET,

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
    async signIn({ user, account, profile }) {
      const { given_name, family_name, email } = profile as KeycloakToken;

      const adUser: any = await getUser(email);
      let ministry = '';
      if (adUser) {
        ministry = parseMinistryFromDisplayName(adUser.displayName);
      }

      const data = {
        firstName: given_name,
        lastName: family_name,
        email,
        ministry,
        idir: adUser.onPremisesSamAccountName,
        upn: adUser.userPrincipalName,
      };

      await prisma.user.upsert({
        where: {
          email,
        },
        update: data,
        create: data,
      });

      return true;
    },
    async jwt({ token, account }: { token: JWT; account: Account | null }) {
      if (account) {
        token.accessToken = account?.access_token;
      }

      const decodedToken = jwt.decode(token.accessToken || '') as any;

      token.roles = decodedToken?.resource_access?.pltsvc?.roles ?? [];

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.isAdmin = false;
      session.roles = [];
      session.ministries = {
        admin: [],
        readonly: [],
      };

      session.previews = {
        awsRoles: !IS_PROD,
        security: !IS_PROD,
      };

      // Send properties to the client, like an access_token from a provider.
      if (token) {
        const user = await prisma.user.findFirst({ where: { email: session.user.email } });
        session.userId = user?.id ?? null;
        session.accessToken = token.accessToken;
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

        session.user.roles = session.roles;
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
