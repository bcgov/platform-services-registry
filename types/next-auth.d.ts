import NextAuth, { DefaultSession, JWT } from 'next-auth/jwt';
import { Permissions, PermissionKey } from './permissions';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      /** The user's postal address. */
      roles: string[];
    } & DefaultSession['user'];
    userId: string | null;
    userEmail: string | null;
    isUser: boolean;
    isAdmin: boolean;
    isEditor: boolean;
    isReader: boolean;
    isAnalyzer: boolean;
    isPrivateAdmin: boolean;
    isPrivateAnalyzer: boolean;
    isPrivateEditor: boolean;
    isPrivateReader: boolean;
    isPublicAdmin: boolean;
    isPublicAnalyzer: boolean;
    isPublicEditor: boolean;
    isPublicReader: boolean;
    isApprover: boolean;
    roles: string[];
    ministries: {
      editor: string[];
      reader: string[];
      [key: string]: string[];
    };
    permissions: {
      createPrivateCloudProducts: boolean;
      viewAllPrivateCloudProducts: boolean;
      editAllPrivateCloudProducts: boolean;
      deleteAllPrivateCloudProducts: boolean;
      reviewAllPrivateCloudRequests: boolean;
      viewPrivateProductHistory: boolean;
      createPublicCloudProducts: boolean;
      viewAllPublicCloudProducts: boolean;
      editAllPublicCloudProducts: boolean;
      deleteAllPublicCloudProducts: boolean;
      reviewAllPublicCloudRequests: boolean;

      createPrivateProductComments: boolean;
      viewAllPrivateProductComments: boolean;
      editAllPrivateProductComments: boolean;
      deleteAllPrivateProductComments: boolean;
      viewPublicProductHistory: boolean;
      createPublicProductComments: boolean;
      viewAllPublicProductComments: boolean;
      editAllPublicProductComments: boolean;
      deleteAllPublicProductComments: boolean;

      viewZapscanResults: boolean;
      viewSonarscanResults: boolean;
      viewPrivateAnalytics: boolean;
      viewPublicAnalytics: boolean;
    };
    previews: {
      history: boolean;
      security: boolean;
      comments: boolean;
    };
  }

  type PermissionsKey = keyof Session['permissions'];
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
