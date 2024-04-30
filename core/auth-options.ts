import { Account, AuthOptions, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import KeycloakProvider, { KeycloakProfile } from 'next-auth/providers/keycloak';
import jwt from 'jsonwebtoken';
import prisma from '@/core/prisma';
import { getUserByEmail } from '@/services/msgraph';
import { IS_PROD, AUTH_SERVER_URL, AUTH_RELM, AUTH_RESOURCE, AUTH_SECRET } from '@/config';

export async function generateSession({ session, token }: { session: Session; token?: JWT }) {
  session.isUser = false;
  session.isAdmin = false;
  session.isEditor = false;
  session.isReader = false;
  session.isAnalyzer = false;
  session.isPrivateAdmin = false;
  session.isPrivateAnalyzer = false;
  session.isPrivateEditor = false;
  session.isPrivateReader = false;
  session.isPublicAdmin = false;
  session.isPublicAnalyzer = false;
  session.isPublicEditor = false;
  session.isPublicReader = false;
  session.isApprover = false;
  session.roles = [];
  session.ministries = {
    editor: [],
    reader: [],
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

      if (role === 'editor') {
        session.isEditor = true;
        return;
      }

      if (role === 'reader') {
        session.isReader = true;
        return;
      }

      if (role === 'analyzer') {
        session.isAnalyzer = true;
        return;
      }

      if (role === 'private-admin') {
        session.isPrivateAdmin = true;
        return;
      }

      if (role === 'private-analyzer') {
        session.isPrivateAnalyzer = true;
        return;
      }

      if (role === 'private-editor') {
        session.isPrivateEditor = true;
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

      if (role === 'public-analyzer') {
        session.isPublicAnalyzer = true;
        return;
      }

      if (role === 'public-editor') {
        session.isPublicEditor = true;
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
        session.ministries[ministryRole].push(ministryCode.toUpperCase());
      }
    });

    session.user.roles = session.roles;
  }

  session.previews = {
    security: !IS_PROD,
    comments: !IS_PROD,
  };

  session.permissions = {
    // Private Products
    createPrivateCloudProducts: session.isUser,
    viewAllPrivateCloudProducts:
      session.isAdmin ||
      session.isEditor ||
      session.isReader ||
      session.isPrivateAdmin ||
      session.isPrivateEditor ||
      session.isPrivateReader,

    viewPrivateProductHistory: session.isAdmin || session.isPrivateAdmin || session.ministries.editor.length > 0,

    editAllPrivateCloudProducts:
      session.isAdmin || session.isEditor || session.isPrivateAdmin || session.isPrivateEditor,
    deleteAllPrivateCloudProducts:
      session.isAdmin || session.isEditor || session.isPrivateAdmin || session.isPrivateEditor,
    reviewAllPrivateCloudRequests: session.isAdmin || session.isPrivateAdmin,

    // Public Products
    createPublicCloudProducts: session.isUser,
    viewAllPublicCloudProducts:
      session.isAdmin ||
      session.isEditor ||
      session.isReader ||
      session.isPublicAdmin ||
      session.isPublicEditor ||
      session.isPublicReader,

    viewPublicProductHistory: session.isAdmin || session.isPublicAdmin || session.ministries.editor.length > 0,

    editAllPublicCloudProducts: session.isAdmin || session.isEditor || session.isPublicAdmin || session.isPublicEditor,
    deleteAllPublicCloudProducts:
      session.isAdmin || session.isEditor || session.isPublicAdmin || session.isPublicEditor,
    reviewAllPublicCloudRequests: session.isAdmin || session.isPublicAdmin,

    createPrivateProductComments: session.isAdmin,
    viewAllPrivateProductComments: session.isAdmin || session.isReader,
    editAllPrivateProductComments: session.isAdmin,
    deleteAllPrivateProductComments: session.isAdmin,

    createPublicProductComments: session.isAdmin,
    viewAllPublicProductComments: session.isAdmin || session.isReader,
    editAllPublicProductComments: session.isAdmin,
    deleteAllPublicProductComments: session.isAdmin,

    viewZapscanResults: session.isAdmin || session.isAnalyzer,
    viewSonarscanResults: session.isAdmin || session.isAnalyzer,
    viewPublicAnalytics: session.isAdmin || session.isAnalyzer || session.isPublicAnalyzer,
    viewPrivateAnalytics: session.isAdmin || session.isAnalyzer || session.isPrivateAnalyzer,
  };

  return session;
}

export const authOptions: AuthOptions = {
  providers: [
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
    /**
     * Relative time from now in seconds when to expire the session
     * @default 2592000 // 30 days
     */
    maxAge: 86400, // 1 day
    /**
     * How often the session should be updated in seconds.
     * If set to `0`, session is updated every time.
     * @default 86400 // 1 day
     */
    updateAge: 3600, // 1 hour
  },
  secret: AUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      const { given_name, family_name, email } = profile as KeycloakProfile;
      const loweremail = email.toLowerCase();

      const data = {
        firstName: given_name,
        lastName: family_name,
        email: loweremail,
        ministry: '',
        idir: '',
        upn: '',
      };

      const adUser = await getUserByEmail(loweremail);
      if (adUser) {
        data.ministry = adUser.ministry;
        data.idir = adUser.idir;
        data.upn = adUser.upn;
      }

      await prisma.user.upsert({
        where: {
          email: loweremail,
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
