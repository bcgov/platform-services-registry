import * as React from 'react';
import { samplePrivateProduct } from '../_components/Params';
import DeleteApprovalTemplate from '../_templates/private-cloud/DeleteApproval';

export default function DeleteApproval() {
  return <DeleteApprovalTemplate product={samplePrivateProduct} />;
}
