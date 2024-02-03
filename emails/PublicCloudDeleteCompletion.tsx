import * as React from 'react';
import { samplePublicProduct } from './_components/Params';
import DeleteApprovalTemplate from './_templates/public-cloud/DeleteApproval';

export const DeleteApproval = () => {
  return <DeleteApprovalTemplate product={samplePublicProduct} />;
};

export default DeleteApproval;
