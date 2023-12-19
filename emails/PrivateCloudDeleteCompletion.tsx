import * as React from 'react';
import { samplePrivateProduct } from './components/Params';
import DeleteApprovalTemplate from './templates/private-cloud/DeleteApproval';

export const DeleteApproval = () => {
  return <DeleteApprovalTemplate product={samplePrivateProduct} />;
};

export default DeleteApproval;
