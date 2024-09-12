import * as React from 'react';
import { samplePublicRequest } from '../_components/Params';
import RequestApprovalTemplate from '../_templates/public-cloud/RequestApproval';

export default function RequestApproval() {
  return <RequestApprovalTemplate request={samplePublicRequest} />;
}
