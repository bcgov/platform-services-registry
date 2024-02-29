import NextAuth, { DefaultSession, JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken?: string;
    user: {
      /** The user's postal address. */
      roles: string[];
    } & DefaultSession['user'];
    userId: string | null;
    isAdmin: boolean;
    roles: string[];
    ministries: {
      admin: string[];
      readonly: string[];
      [key: string]: string[];
    };
    permissions: {
      viewZapscanResults: boolean;
      viewSonarscanReulsts: boolean;
      viewAnalytics: boolean;
    };
    previews: {
      awsRoles: boolean;
      security: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    idToken?: string;
    accessToken?: string; // declare accessToken here too
    roles?: string[];
  }
}
