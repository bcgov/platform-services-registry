import * as React from 'react';
import { samplePrivateRequest } from '../_components/Params';
import DeleteRequestApprovalTemplate from '../_templates/private-cloud/DeleteRequestApproval';

export default function DeleteRequestApproval() {
  return <DeleteRequestApprovalTemplate request={samplePrivateRequest} />;
}
