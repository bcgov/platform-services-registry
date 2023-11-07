import * as React from 'react';
import { sampleRequest } from './components/Params';
import { RequestApprovalTemplate } from './templates/RequestApproval';

export const RequestApproval = () => {
  return <RequestApprovalTemplate request={sampleRequest} />;
};

export default RequestApproval;
