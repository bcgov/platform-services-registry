import * as React from 'react';
import { samplePrivateProduct } from './_components/Params';
import DeleteApprovalTemplate from './_templates/private-cloud/DeleteApproval';

export const DeleteApproval = () => {
  return <DeleteApprovalTemplate product={samplePrivateProduct} />;
};

export default DeleteApproval;
