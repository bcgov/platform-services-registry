import * as React from 'react';
import { samplePublicProduct } from './components/Params';
import DeleteApprovalTemplate from './templates/public-cloud/DeleteApproval';

export const DeleteApproval = () => {
  return <DeleteApprovalTemplate product={samplePublicProduct} />;
};

export default DeleteApproval;
