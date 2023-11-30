import * as React from 'react';
import { sampleRequest } from './components/Params';
import { RequestApprovalTemplate } from './templates/private-cloud/RequestApproval';

export const RequestApproval = () => {
  return <RequestApprovalTemplate request={sampleRequest} />;
};

export default RequestApproval;
