import * as React from 'react';
import { samplePrivateProduct } from './components/Params';
import ProvisionedTemplate from './templates/private-cloud/Provisioned';

export const EditRequest = (): any => {
  return <ProvisionedTemplate product={samplePrivateProduct} />;
};

export default EditRequest;
