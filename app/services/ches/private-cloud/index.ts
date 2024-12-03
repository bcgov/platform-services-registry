import { DecisionStatus, RequestType } from '@prisma/client';
import { logger } from '@/core/logging';
import { PrivateCloudRequestDetailDecorated } from '@/types/private-cloud';
import {
  sendAdminCreateRequest,
  sendAdminDeleteRequest,
  sendAdminEditRequest,
  sendAdminEditRequestQuotaAutoApproval,
  sendTeamCreateRequest,
  sendTeamCreateRequestApproval,
  sendTeamCreateRequestCompletion,
  sendTeamCreateRequestRejection,
  sendTeamDeleteRequest,
  sendTeamDeleteRequestApproval,
  sendTeamDeleteRequestCompletion,
  sendTeamDeleteRequestRejection,
  sendTeamEditRequest,
  sendTeamEditRequestApproval,
  sendTeamEditRequestCompletion,
  sendTeamEditRequestRejection,
} from './emails';

export function sendAdminCreateRequestEmail(request: PrivateCloudRequestDetailDecorated, requester: string) {
  try {
    const proms = [];

    proms.push(sendAdminCreateRequest(request, requester));
    return Promise.all(proms);
  } catch (error) {
    logger.error('sendAdminCreateRequestEmail:', error);
  }
}

export function sendAdminDeleteRequestEmail(request: PrivateCloudRequestDetailDecorated, requester: string) {
  try {
    const proms = [];

    proms.push(sendAdminDeleteRequest(request, requester));
    return Promise.all(proms);
  } catch (error) {
    logger.error('sendAdminDeleteRequestEmail:', error);
  }
}

export function sendAdminEditRequestEmail(request: PrivateCloudRequestDetailDecorated, requester: string) {
  try {
    const proms = [];

    proms.push(sendAdminEditRequest(request, requester));
    return Promise.all(proms);
  } catch (error) {
    logger.error('sendAdminEditRequestEmail:', error);
  }
}

export function sendCreateRequestEmails(request: PrivateCloudRequestDetailDecorated, requester: string) {
  try {
    const proms = [];
    proms.push(sendTeamCreateRequest(request, requester));

    return Promise.all(proms);
  } catch (error) {
    logger.error('sendCreateRequestEmails:', error);
  }
}

export function sendEditRequestEmails(request: PrivateCloudRequestDetailDecorated, requester: string) {
  try {
    const proms = [];
    proms.push(sendTeamEditRequest(request, requester));

    return Promise.all(proms);
  } catch (error) {
    logger.error('sendEditRequestEmails:', error);
  }
}

export function sendDeleteRequestEmails(request: PrivateCloudRequestDetailDecorated, requester: string) {
  try {
    const proms = [];
    proms.push(sendTeamDeleteRequest(request, requester));

    return Promise.all(proms);
  } catch (error) {
    logger.error('sendDeleteRequestEmails:', error);
  }
}

export function sendRequestApprovalEmails(request: PrivateCloudRequestDetailDecorated, requester: string) {
  try {
    const proms = [];

    if (request.type == RequestType.CREATE) {
      proms.push(sendTeamCreateRequestApproval(request));
    } else if (request.type == RequestType.EDIT) {
      proms.push(sendTeamEditRequestApproval(request));

      if (request.decisionStatus === DecisionStatus.AUTO_APPROVED && request.changes?.quotasIncrease) {
        proms.push(sendAdminEditRequestQuotaAutoApproval(request, requester));
      }
    } else if (request.type == RequestType.DELETE) {
      proms.push(sendTeamDeleteRequestApproval(request));
    }

    return Promise.all(proms);
  } catch (error) {
    logger.error('sendRequestApprovalEmails:', error);
  }
}

export function sendRequestRejectionEmails(request: PrivateCloudRequestDetailDecorated) {
  try {
    const proms = [];

    if (request.type == RequestType.CREATE) {
      proms.push(sendTeamCreateRequestRejection(request));
    } else if (request.type == RequestType.EDIT) {
      proms.push(sendTeamEditRequestRejection(request));
    } else if (request.type == RequestType.DELETE) {
      proms.push(sendTeamDeleteRequestRejection(request));
    }

    return Promise.all(proms);
  } catch (error) {
    logger.error('sendRequestRejectionEmails:', error);
  }
}

export function sendRequestCompletionEmails(request: PrivateCloudRequestDetailDecorated) {
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
