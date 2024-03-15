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
    isUser: boolean;
    isAdmin: boolean;
    isReader: boolean;
    isPrivateAdmin: boolean;
    isPrivateReader: boolean;
    isPublicAdmin: boolean;
    isPublicReader: boolean;
    isApprover: boolean;
    roles: string[];
    ministries: {
      admin: string[];
      readonly: string[];
      [key: string]: string[];
    };
    permissions: {
      createPrivateCloudProducts: boolean;
      viewAllPrivateCloudProducts: boolean;
      editAllPrivateCloudProducts: boolean;
      deleteAllPrivateCloudProducts: boolean;
      reviewAllPrivateCloudRequests: boolean;

      createPublicCloudProducts: boolean;
      viewAllPublicCloudProducts: boolean;
      editAllPublicCloudProducts: boolean;
      deleteAllPublicCloudProducts: boolean;
      reviewAllPublicCloudRequests: boolean;

      createProductComments: boolean;
      viewAllProductComments: boolean;
      editAllProductComments: boolean;
      deleteAllProductComments: boolean;

      viewZapscanResults: boolean;
      viewSonarscanReulsts: boolean;
      viewAnalytics: boolean;
    };
    previews: {
      awsRoles: boolean;
      security: boolean;
      expenseAuthority: boolean;
      history: boolean;
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
