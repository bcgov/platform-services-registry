import * as React from 'react';
import { samplePrivateRequest } from './_components/Params';
import RequestApprovalTemplate from './_templates/private-cloud/RequestApproval';

export const RequestApproval = () => {
  return <RequestApprovalTemplate request={samplePrivateRequest} />;
};

export default RequestApproval;
