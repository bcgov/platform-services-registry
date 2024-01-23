import * as React from 'react';
import { samplePublicRequest } from './_components/Params';
import RequestApprovalTemplate from './_templates/public-cloud/RequestApproval';

export const RequestApproval = () => {
  return <RequestApprovalTemplate request={samplePublicRequest} />;
};

export default RequestApproval;
