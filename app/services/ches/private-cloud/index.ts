import { DecisionStatus, RequestType } from '@prisma/client';
import { logger } from '@/core/logging';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';
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

export function sendCreateRequestEmails(request: PrivateCloudRequestDetail, requester: string) {
  try {
    const proms = [];

    proms.push(sendAdminCreateRequest(request, requester));
    proms.push(sendTeamCreateRequest(request, requester));

    return Promise.all(proms);
  } catch (error) {
    logger.error('sendCreateRequestEmails:', error);
  }
}

export function sendEditRequestEmails(request: PrivateCloudRequestDetail, requester: string) {
  try {
    const proms = [];

    proms.push(sendTeamEditRequest(request, requester));

    if (request.decisionStatus === DecisionStatus.PENDING) {
      proms.push(sendAdminEditRequest(request, requester));
    }

    return Promise.all(proms);
  } catch (error) {
    logger.error('sendEditRequestEmails:', error);
  }
}

export function sendDeleteRequestEmails(request: PrivateCloudRequestDetail, requester: string) {
  try {
    const proms = [];

    proms.push(sendAdminDeleteRequest(request, requester));
    proms.push(sendTeamDeleteRequest(request, requester));

    return Promise.all(proms);
  } catch (error) {
    logger.error('sendDeleteRequestEmails:', error);
  }
}

export function sendRequestApprovalEmails(request: PrivateCloudRequestDetail, requester: string) {
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

export function sendRequestRejectionEmails(request: PrivateCloudRequestDetail) {
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

export function sendRequestCompletionEmails(request: PrivateCloudRequestDetail) {
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
