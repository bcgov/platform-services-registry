import NextAuth, { Account, AuthOptions, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import KeycloakProvider from 'next-auth/providers/keycloak';
import jwt from 'jsonwebtoken';
import prisma from '@/core/prisma';
import { getUser } from '@/services/msgraph';
import { IS_PROD, AUTH_SERVER_URL, AUTH_RELM, AUTH_RESOURCE, AUTH_SECRET } from '@/config';

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

export async function generateSession({ session, token }: { session: Session; token?: JWT }) {
  session.isUser = false;
  session.isAdmin = false;
  session.isReader = false;
  session.isPrivateAdmin = false;
  session.isPrivateReader = false;
  session.isPublicAdmin = false;
  session.isPublicReader = false;
  session.isApprover = false;
  session.roles = [];
  session.ministries = {
    admin: [],
    readonly: [],
  };

  // Send properties to the client, like an access_token from a provider.
  if (token) {
    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
      select: { id: true, email: true },
    });

    session.userId = user?.id ?? null;
    session.userEmail = user?.email ?? null;
    session.accessToken = token.accessToken;
    session.roles = token.roles || [];

    // Assign the 'user' role to users who log in to the system.
    session.roles.push('user');

    session.roles.forEach((role) => {
      if (role === 'user') {
        session.isUser = true;
        return;
      }

      if (role === 'admin') {
        session.isAdmin = true;
        return;
      }

      if (role === 'reader') {
        session.isReader = true;
        return;
      }

      if (role === 'private-admin') {
        session.isPrivateAdmin = true;
        return;
      }

      if (role === 'private-reader') {
        session.isPrivateReader = true;
        return;
      }

      if (role === 'public-admin') {
        session.isPublicAdmin = true;
        return;
      }

      if (role === 'public-reader') {
        session.isPublicReader = true;
        return;
      }

      if (role === 'approver') {
        session.isApprover = true;
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

  session.previews = {
    awsRoles: !IS_PROD,
    security: !IS_PROD,
    expenseAuthority: !IS_PROD,
    history: !IS_PROD,
  };

  session.permissions = {
    createPrivateCloudProducts: session.isUser,
    viewAllPrivateCloudProducts:
      session.isAdmin || session.isReader || session.isPrivateAdmin || session.isPrivateReader,
    editAllPrivateCloudProducts: session.isAdmin || session.isPrivateAdmin,
    deleteAllPrivateCloudProducts: session.isAdmin || session.isPrivateAdmin,
    reviewAllPrivateCloudRequests: session.isAdmin || session.isPrivateAdmin,
    createPublicCloudProducts: session.isUser,
    viewAllPublicCloudProducts: session.isAdmin || session.isReader || session.isPublicAdmin || session.isPublicReader,
    editAllPublicCloudProducts: session.isAdmin || session.isPublicAdmin,
    deleteAllPublicCloudProducts: session.isAdmin || session.isPublicAdmin,
    reviewAllPublicCloudRequests: session.isAdmin || session.isPublicAdmin,
    createProductComments: session.isAdmin,
    viewAllProductComments: session.isAdmin || session.isReader,
    editAllProductComments: session.isAdmin,
    deleteAllProductComments: session.isAdmin,
    viewZapscanResults: session.isAdmin || session.isReader,
    viewSonarscanReulsts: session.isAdmin || session.isReader,
    viewAnalytics: session.isAdmin || session.isReader,
  };

  // {
  //   ...
  //   roles: ['admin', 'ministry-citz-admin'],
  //   isAdmin: true,
  //   ministries: { admin: ['citz'], readonly: [] },
  // }
  return session;
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
      const data = {
        firstName: given_name,
        lastName: family_name,
        email,
        ministry: '',
        idir: '',
        upn: '',
      };

      const adUser = await getUser(email);
      if (adUser) {
        data.ministry = adUser.ministry;
        data.idir = adUser.idir;
        data.upn = adUser.upn;
      }

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
    session: generateSession.bind(this),
  },
};
