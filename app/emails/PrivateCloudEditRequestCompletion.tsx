import * as React from 'react';
import { samplePrivateProduct } from './_components/Params';
import EditCompleteTemplate from './_templates/private-cloud/EditRequestComplete';

export default function DeleteApproval() {
  return <EditCompleteTemplate product={samplePrivateProduct} />;
}
