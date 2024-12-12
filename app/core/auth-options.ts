import { EventType, TaskStatus } from '@prisma/client';
import axios from 'axios';
import { addMinutes } from 'date-fns';
import jwt from 'jsonwebtoken';
import _forEach from 'lodash-es/forEach';
import _get from 'lodash-es/get';
import _uniq from 'lodash-es/uniq';
import { Account, AuthOptions, Session, User, SessionKeys, Permissions, SessionTokenTeams } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import KeycloakProvider, { KeycloakProfile } from 'next-auth/providers/keycloak';
import {
  IS_PROD,
  AUTH_SERVER_URL,
  AUTH_RELM,
  AUTH_RESOURCE,
  AUTH_SECRET,
  PUBLIC_AZURE_ACCESS_EMAILS,
  USER_TOKEN_REFRESH_INTERVAL,
} from '@/config';
import { TEAM_SA_PREFIX, GlobalRole, RoleToSessionProp, sessionRolePropKeys } from '@/constants';
import prisma from '@/core/prisma';
import { createEvent } from '@/services/db';
import { upsertUser } from '@/services/db/user';

interface DecodedToken {
  resource_access?: Record<string, { roles: string[] }>;
  sub: string;
}

function processTokens(tokens?: { access_token?: string; refresh_token?: string; id_token?: string }) {
  const { access_token = '', refresh_token = '', id_token = '' } = tokens ?? {};
  const decodedToken = jwt.decode(access_token) as DecodedToken;
  const { resource_access = {}, sub = '' } = decodedToken || {};

  const roles = _get(resource_access, `${AUTH_RESOURCE}.roles`, []);
  const teams: SessionTokenTeams[] = [];

  _forEach(resource_access, (val, key) => {
    if (key.startsWith(TEAM_SA_PREFIX)) {
      teams.push({ clientId: key, roles: val.roles });
    }
  });

  return {
    roles,
    sub,
    teams,
    accessToken: access_token,
    refreshToken: refresh_token,
    idToken: id_token,
  };
}

async function getNewTokens(refreshToken: string) {
  const tokenEndpoint = `${AUTH_SERVER_URL}/realms/${AUTH_RELM}/protocol/openid-connect/token`;
  const params = new URLSearchParams({
    client_id: AUTH_RESOURCE,
    client_secret: AUTH_SECRET,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  try {
    const response = await axios.post(tokenEndpoint, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data;
  } catch (error) {
    return null;
  }
}

export async function generateSession({ session, token }: { session: Session; token?: JWT }) {
  if (token?.isRefreshTokenExpired) session.isExpired = true;

  sessionRolePropKeys.forEach((key: SessionKeys) => {
    // @ts-ignore: Ignore TypeScript error for dynamic property assignment
    session[key] = false;
  });
  session.roles = [];
  session.ministries = {
    editor: [],
    reader: [],
  };

  session.user = {
    id: '',
    name: '',
    email: '',
    image: '',
  };

  session.tasks = [];

  if (token) {
    session.idToken = token.idToken ?? '';
    session.kcUserId = token.sub ?? '';
    session.user.name = token.name ?? '';
    session.roles = token.roles || [];
    session.teams = (token.teams as any) || [];

    if (token.email) {
      const user = await prisma.user.findFirst({
        where: { email: token.email },
        select: { id: true, email: true, image: true },
      });

      if (user) {
        session.user.id = user.id;
        session.user.email = user.email;
        session.user.image = user.image;

        session.userId = user.id;
        session.userEmail = user.email;
        session.roles.push(GlobalRole.User);
      }
    }

    session.roles = [..._uniq(session.roles)];
    session.roles.forEach((role) => {
      const roleKey = RoleToSessionProp[role as GlobalRole];
      if (roleKey && roleKey in session) {
        // @ts-ignore: Ignore TypeScript error for dynamic property assignment
        session[roleKey] = true;
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
  }

  const azureEmails = PUBLIC_AZURE_ACCESS_EMAILS.split(',').map((v) => v.trim().toLowerCase());

  session.previews = {
    security: !IS_PROD,
    apiAccount: !IS_PROD,
    azure: session.isAdmin || session.isPublicAdmin || azureEmails.includes(session.user.email.toLowerCase()),
    awsLza: !IS_PROD,
  };

  session.permissions = {
    // Private Products
    createPrivateCloudProducts: session.isAdmin || session.isPrivateAdmin,
    viewAllPrivateCloudProducts:
      session.isAdmin ||
      session.isEditor ||
      session.isReader ||
      session.isPrivateAdmin ||
      session.isPrivateEditor ||
      session.isPrivateReader ||
      session.isPrivateReviewer,

    viewAllPrivateCloudProductsHistory: session.isAdmin || session.isPrivateAdmin,

    editAllPrivateCloudProducts:
      session.isAdmin || session.isEditor || session.isPrivateAdmin || session.isPrivateEditor,
    deleteAllPrivateCloudProducts:
      session.isAdmin || session.isEditor || session.isPrivateAdmin || session.isPrivateEditor,
    reviewAllPrivateCloudRequests: session.isAdmin || session.isPrivateAdmin || session.isPrivateReviewer,

    createPrivateCloudProductsAsAssignee: session.isUser,
    viewAssignedPrivateCloudProducts: session.isUser,
    editAssignedPrivateCloudProducts: session.isUser,
    deleteAssignedPrivateCloudProducts: session.isUser,

    // Public Products
    createPublicCloudProducts: session.isAdmin || session.isPublicAdmin,
    viewAllPublicCloudProducts:
      session.isAdmin ||
      session.isEditor ||
      session.isReader ||
      session.isPublicAdmin ||
      session.isPublicEditor ||
      session.isPublicReader ||
      session.isBillingReviewer ||
      session.isBillingReader ||
      session.isPublicReviewer,

    viewAllPublicCloudProductsHistory: session.isAdmin || session.isPublicAdmin,

    editAllPublicCloudProducts: session.isAdmin || session.isEditor || session.isPublicAdmin || session.isPublicEditor,
    deleteAllPublicCloudProducts:
      session.isAdmin || session.isEditor || session.isPublicAdmin || session.isPublicEditor,
    reviewAllPublicCloudRequests: session.isAdmin || session.isPublicAdmin || session.isPublicReviewer,

    createPrivateProductComments: session.isAdmin || session.isPrivateAdmin,
    viewAllPrivateProductComments: session.isAdmin || session.isPrivateAdmin,
    editAllPrivateProductComments: session.isAdmin || session.isPrivateAdmin,
    deleteAllPrivateProductComments: session.isAdmin || session.isPrivateAdmin,

    createPublicProductComments: session.isAdmin || session.isPublicAdmin,
    viewAllPublicProductComments: session.isAdmin || session.isPublicAdmin,
    editAllPublicProductComments: session.isAdmin || session.isPublicAdmin,
    deleteAllPublicProductComments: session.isAdmin || session.isPublicAdmin,

    createPublicCloudProductsAsAssignee: session.isUser,
    viewAssignedPublicCloudProducts: session.isUser,
    editAssignedPublicCloudProducts: session.isUser,
    deleteAssignedPublicCloudProducts: session.isUser,

    viewZapscanResults: session.isAdmin || session.isAnalyzer,
    viewSonarscanResults: session.isAdmin || session.isAnalyzer,
    viewGeneralAnalytics: session.isAdmin || session.isAnalyzer,
    viewPublicAnalytics: session.isAdmin || session.isAnalyzer || session.isPublicAnalyzer,
    viewPrivateAnalytics: session.isAdmin || session.isAnalyzer || session.isPrivateAnalyzer,

    downloadBillingMou: session.isBillingReviewer || session.isBillingReader,
    viewUsers: session.isAdmin || session.isUserReader,
    editUsers: session.isAdmin,
  };

  session.permissionList = Object.keys(session.permissions).filter(
    (key) => session.permissions[key as keyof Permissions],
  );

  if (session.user.id) {
    session.tasks = await prisma.task.findMany({
      where: {
        OR: [
          { userIds: { has: session.user.id } },
          { roles: { hasSome: session.roles } },
          { permissions: { hasSome: session.permissionList } },
        ],
        status: TaskStatus.ASSIGNED,
      },
    });
  }

  return session;
}

export const authOptions: AuthOptions = {
  providers: [
    // See https://github.com/nextauthjs/next-auth/blob/93e108763f434a4fd33c74ed79d17d7368dfd27b/packages/next-auth/src/providers/keycloak.ts#L27
    KeycloakProvider({
      clientId: AUTH_RESOURCE!,
      clientSecret: AUTH_SECRET!,
      issuer: `${AUTH_SERVER_URL}/realms/${AUTH_RELM}`,
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
      const lastSeen = new Date();
      const nextTokenRefreshTime = addMinutes(new Date(), USER_TOKEN_REFRESH_INTERVAL);

      const upsertedUser = await upsertUser(loweremail, { lastSeen, nextTokenRefreshTime });
      if (!upsertedUser) {
        const data = {
          providerUserId: '',
          firstName: given_name,
          lastName: family_name,
          email: loweremail,
          ministry: '',
          idir: '',
          idirGuid: '',
          upn: '',
          image: '',
          officeLocation: '',
          jobTitle: '',
          lastSeen,
          nextTokenRefreshTime,
        };

        await prisma.user.upsert({
          where: { email: loweremail },
          update: data,
          create: data,
        });
      }

      return true;
    },
    async jwt({ token, account }: { token: JWT; account: Account | null }) {
      if (account) {
        return Object.assign(token, processTokens(account));
      }

      if (!token.email) {
        return token;
      }

      const now = new Date();
      const loweremail = token.email.toLowerCase();

      // 1. nextTokenRefreshTime has value (valid datetime)
      // 1-1. the datetime is less than now           ==> refresh the token
      // 1-2. the datetime is not less than now       ==> do nothing
      // 2. nextTokenRefreshTime no value (null)      ==> refresh the token
      const { count } = await prisma.user.updateMany({
        where: {
          email: loweremail,
          OR: [{ nextTokenRefreshTime: { not: null, lt: now } }, { nextTokenRefreshTime: null }],
        },
        data: {
          nextTokenRefreshTime: addMinutes(now, USER_TOKEN_REFRESH_INTERVAL),
        },
      });

      if (count > 0) {
        const newTokens = await getNewTokens(token.refreshToken);
        if (!newTokens) {
          token.isRefreshTokenExpired = true;
        } else {
          Object.assign(token, processTokens(newTokens));
        }
      }

      return token;
    },
    session: generateSession.bind(this),
  },
  events: {
    async signIn({ user, account }: { user: User; account: Account | null }) {
      if (!user?.email) return;

      const loweremail = user.email.toLowerCase();
      const loggedInUser = await prisma.user.findUnique({
        where: { email: loweremail },
        select: { id: true },
      });

      if (!loggedInUser) return;

      await createEvent(EventType.LOGIN, loggedInUser.id);
    },
    async signOut({ session, token }: { session: Session; token: JWT }) {
      if (!token?.email) return;

      const loweremail = token.email.toLowerCase();
      const loggedInUser = await prisma.user.findUnique({
        where: { email: loweremail },
        select: { id: true },
      });

      if (!loggedInUser) return;

      await createEvent(EventType.LOGOUT, loggedInUser.id);
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (!session.user.id) return;
      await prisma.user.update({ where: { id: session.user.id }, data: { lastSeen: new Date() } });
    },
  },
};
