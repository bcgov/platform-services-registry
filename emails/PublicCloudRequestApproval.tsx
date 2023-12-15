import * as React from 'react';
import { samplePublicRequest } from './components/Params';
import RequestApprovalTemplate from './templates/public-cloud/RequestApproval';

export const RequestApproval = () => {
  return <RequestApprovalTemplate request={samplePublicRequest} />;
};

export default RequestApproval;
