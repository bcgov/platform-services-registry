import NextAuth, { DefaultSession, JWT } from 'next-auth/jwt';
import { User } from 'next-auth';
import { Permissions, PermissionKey } from './permissions';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    idToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      image: string | null;
    };
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
      viewAllPrivateCloudProductsHistory: boolean;
      editAllPrivateCloudProducts: boolean;
      deleteAllPrivateCloudProducts: boolean;
      reviewAllPrivateCloudRequests: boolean;

      createPublicCloudProducts: boolean;
      viewAllPublicCloudProducts: boolean;
      viewAllPublicCloudProductsHistory: boolean;
      editAllPublicCloudProducts: boolean;
      deleteAllPublicCloudProducts: boolean;
      reviewAllPublicCloudRequests: boolean;

      createPrivateProductComments: boolean;
      viewAllPrivateProductComments: boolean;
      editAllPrivateProductComments: boolean;
      deleteAllPrivateProductComments: boolean;

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
