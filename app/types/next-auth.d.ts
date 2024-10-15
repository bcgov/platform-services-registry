import { Prisma } from '@prisma/client';
import { User } from 'next-auth';
import NextAuth, { DefaultSession, JWT } from 'next-auth/jwt';

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

    downloadBillingMou: boolean;
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
    isPrivateReviewer: boolean;
    isPublicAdmin: boolean;
    isPublicAnalyzer: boolean;
    isPublicEditor: boolean;
    isPublicReader: boolean;
    isPublicReviewer: boolean;
    isApprover: boolean;
    isBillingReviewer: boolean;
    isBillingReader: boolean;
    roles: string[];
    teams: { clientId: string; roles: string[] }[];
    ministries: {
      editor: string[];
      reader: string[];
      [key: string]: string[];
    };
    permissions: Permissions;
    tasks: Prisma.TaskGetPayload<null>[];
    previews: {
      security: boolean;
      apiAccount: boolean;
      azure: boolean;
      awsLza: boolean;
    };
  }

  type PermissionsKey = keyof Permissions;
  type SessionKeys = keyof typeof Session;
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

// This issue requires further investigation.
// See https://github.com/pmndrs/valtio/issues/327#issuecomment-1035937848
declare module 'valtio' {
  function useSnapshot<T extends object>(p: T): T;
}
