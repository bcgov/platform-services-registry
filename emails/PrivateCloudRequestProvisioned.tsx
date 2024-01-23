import * as React from 'react';
import { samplePrivateProduct } from './_components/Params';
import ProvisionedTemplate from './_templates/private-cloud/Provisioned';

export const EditRequest = (): any => {
  return <ProvisionedTemplate product={samplePrivateProduct} />;
};

export default EditRequest;
