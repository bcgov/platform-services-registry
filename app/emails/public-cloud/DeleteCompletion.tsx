import * as React from 'react';
import { samplePublicProduct } from '../_components/Params';
import DeleteApprovalTemplate from '../_templates/public-cloud/DeleteApproval';

export default function DeleteApproval() {
  return <DeleteApprovalTemplate product={samplePublicProduct} />;
}
