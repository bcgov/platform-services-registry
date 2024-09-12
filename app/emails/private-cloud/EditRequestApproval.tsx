import * as React from 'react';
import { samplePrivateRequest } from '../_components/Params';
import EditRequestApprovalTemplate from '../_templates/private-cloud/EditRequestApproval';

export default function EditRequestApproval() {
  return <EditRequestApprovalTemplate request={samplePrivateRequest} />;
}
