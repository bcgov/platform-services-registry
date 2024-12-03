import { RequestType } from '@prisma/client';
import { logger } from '@/core/logging';
import { PublicCloudRequestDetailDecorated } from '@/types/public-cloud';
import {
  sendAdminCreateRequest,
  sendAdminDeleteRequest,
  sendTeamCreateRequest,
  sendTeamCreateRequestApproval,
  sendTeamCreateRequestCompletion,
  sendTeamCreateRequestRejection,
  sendTeamDeleteRequest,
  sendTeamDeleteRequestApproval,
  sendTeamDeleteRequestCompletion,
  sendTeamDeleteRequestRejection,
  sendTeamEditRequest,
  sendTeamEditRequestCompletion,
  sendBillingReviewerMou,
  sendEmouServiceAgreement,
  sendExpenseAuthority,
  sendExpenseAuthorityMou,
} from './emails';

export function sendAdminCreateRequestEmail(request: PublicCloudRequestDetailDecorated, requester: string) {
  try {
    const proms = [];

    proms.push(sendAdminCreateRequest(request, requester));
    return Promise.all(proms);
  } catch (error) {
    logger.error('sendAdminCreateRequestEmail:', error);
  }
}

export function sendAdminDeleteRequestEmail(request: PublicCloudRequestDetailDecorated, requester: string) {
  try {
    const proms = [];

    proms.push(sendAdminDeleteRequest(request, requester));
    return Promise.all(proms);
  } catch (error) {
    logger.error('sendAdminDeleteRequestEmail:', error);
  }
}

export function sendAdminCreateRequestEmails(request: PublicCloudRequestDetailDecorated, requester: string) {
  try {
    const proms = [];
    proms.push(sendEmouServiceAgreement(request));

    return Promise.all(proms);
  } catch (error) {
    logger.error('sendRequestReviewEmails:', error);
  }
}

export function sendCreateRequestEmails(request: PublicCloudRequestDetailDecorated, requester: string) {
  try {
    const proms = [];

    proms.push(sendTeamCreateRequest(request, requester));

    if (request.decisionData?.billing && request.decisionData.billing.approved) {
      proms.push(sendAdminCreateRequestEmails(request, requester));
    } else {
      proms.push(sendExpenseAuthorityMou(request));
    }

    return Promise.all(proms);
  } catch (error) {
    logger.error('sendCreateRequestEmails:', error);
  }
}

export function sendEditRequestEmails(request: PublicCloudRequestDetailDecorated, requester: string) {
  try {
    const proms = [];

    proms.push(sendTeamEditRequest(request, requester));

    return Promise.all(proms);
  } catch (error) {
    logger.error('sendEditRequestEmails:', error);
  }
}

export function sendDeleteRequestEmails(request: PublicCloudRequestDetailDecorated, requester: string) {
  try {
    const proms = [];
    proms.push(sendTeamDeleteRequest(request, requester));

    return Promise.all(proms);
  } catch (error) {
    logger.error('sendDeleteRequestEmails:', error);
  }
}

export function sendRequestApprovalEmails(request: PublicCloudRequestDetailDecorated) {
  try {
    const proms = [];

    if (request.type == RequestType.CREATE) {
      proms.push(sendTeamCreateRequestApproval(request));
    } else if (request.type == RequestType.DELETE) {
      proms.push(sendTeamDeleteRequestApproval(request));
    }

    if (request.originalData?.expenseAuthorityId !== request.decisionData.expenseAuthorityId) {
      proms.push(sendExpenseAuthority(request));
    }

    return Promise.all(proms);
  } catch (error) {
    logger.error('sendRequestApprovalEmails:', error);
  }
}

export function sendRequestRejectionEmails(request: PublicCloudRequestDetailDecorated) {
  try {
    const proms = [];

    if (request.type == RequestType.CREATE) {
      proms.push(sendTeamCreateRequestRejection(request));
    } else if (request.type == RequestType.DELETE) {
      proms.push(sendTeamDeleteRequestRejection(request));
    }

    return Promise.all(proms);
  } catch (error) {
    logger.error('sendRequestRejectionEmails:', error);
  }
}

export function sendRequestCompletionEmails(request: PublicCloudRequestDetailDecorated) {
  try {
    const proms = [];

    if (request.type == RequestType.CREATE) {
      proms.push(sendTeamCreateRequestCompletion(request));
    } else if (request.type == RequestType.EDIT) {
      proms.push(sendTeamEditRequestCompletion(request));
    } else if (request.type == RequestType.DELETE) {
      proms.push(sendTeamDeleteRequestCompletion(request));
    }

    return Promise.all(proms);
  } catch (error) {
    logger.error('sendRequestCompletionEmails:', error);
  }
}

export function sendPublicCloudBillingReviewEmails(request: PublicCloudRequestDetailDecorated) {
  try {
    const proms = [];
    proms.push(sendBillingReviewerMou(request));

    return Promise.all(proms);
  } catch (error) {
    logger.error('sendPublicCloudBillingReviewEmails:', error);
  }
}
