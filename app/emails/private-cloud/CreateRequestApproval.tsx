import * as React from 'react';
import { samplePrivateRequest } from '../_components/Params';
import CreateRequestApprovalTemplate from '../_templates/private-cloud/CreateRequestApproval';

export default function CreateRequestApproval() {
  return <CreateRequestApprovalTemplate request={samplePrivateRequest} />;
}
