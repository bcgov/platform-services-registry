import * as React from 'react';
import { samplePublicProduct } from './components/Params';
import ProvisionedTemplate from './templates/public-cloud/Provisioned';

export const EditRequest = (): any => {
  return <ProvisionedTemplate product={samplePublicProduct} />;
};

export default EditRequest;
