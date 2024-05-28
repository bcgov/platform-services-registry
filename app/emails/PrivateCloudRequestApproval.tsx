import * as React from 'react';
import { samplePrivateEditRequest } from './_components/Params';
import RequestApprovalTemplate from './_templates/private-cloud/RequestApproval';

export default function RequestApproval() {
  return <RequestApprovalTemplate request={samplePrivateEditRequest} />;
}
