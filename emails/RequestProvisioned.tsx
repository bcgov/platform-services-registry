import * as React from 'react';
import { samplePrivateProduct } from './components/Params';
import ProvisionedTemplate from './templates/ProvisionedTemplate';

export const EditRequest = (): any => {
  return <ProvisionedTemplate product={samplePrivateProduct} />;
};

export default EditRequest;
