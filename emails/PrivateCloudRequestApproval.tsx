import * as React from 'react';
import { samplePrivateRequest } from './components/Params';
import { RequestApprovalTemplate } from './templates/private-cloud/RequestApproval';

export const RequestApproval = () => {
  return <RequestApprovalTemplate request={samplePrivateRequest} />;
};

export default RequestApproval;
