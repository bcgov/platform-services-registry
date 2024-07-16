import { User } from 'next-auth';
import NextAuth, { DefaultSession, JWT } from 'next-auth/jwt';
import { Permissions, PermissionKey } from './permissions';

declare module 'next-auth' {
  interface Permissions {
    createPrivateCloudProducts: boolean;
    viewAllPrivateCloudProducts: boolean;
    viewAllPrivateCloudProductsHistory: boolean;
    editAllPrivateCloudProducts: boolean;
    deleteAllPrivateCloudProducts: boolean;
    reviewAllPrivateCloudRequests: boolean;
    createPrivateCloudProductsAsAssignee: boolean;
    viewAssignedPrivateCloudProducts: boolean;
    editAssignedPrivateCloudProducts: boolean;
    deleteAssignedPrivateCloudProducts: boolean;

    createPublicCloudProducts: boolean;
    viewAllPublicCloudProducts: boolean;
    viewAllPublicCloudProductsHistory: boolean;
    editAllPublicCloudProducts: boolean;
    deleteAllPublicCloudProducts: boolean;
    reviewAllPublicCloudRequests: boolean;
    createPublicCloudProductsAsAssignee: boolean;
    viewAssignedPublicCloudProducts: boolean;
    editAssignedPublicCloudProducts: boolean;
    deleteAssignedPublicCloudProducts: boolean;

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
    viewGeneralAnalytics: boolean;
    viewPrivateAnalytics: boolean;
    viewPublicAnalytics: boolean;
  }

  interface Session extends DefaultSession {
    idToken: string;
    kcUserId: string;
    user: {
      id: string;
      name: string;
      email: string;
      image: string | null;
    };
    userId: string | null;
    userEmail: string | null;
    isServiceAccount: boolean;
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
    teams: { clientId: string; roles: string[] }[];
    ministries: {
      editor: string[];
      reader: string[];
      [key: string]: string[];
    };
    permissions: Permissions;
    previews: {
      security: boolean;
      apiAccount: boolean;
      azure: boolean;
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
