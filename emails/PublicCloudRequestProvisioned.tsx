import * as React from 'react';
import { samplePublicProduct } from './_components/Params';
import ProvisionedTemplate from './_templates/public-cloud/Provisioned';

export const EditRequest = (): any => {
  return <ProvisionedTemplate product={samplePublicProduct} />;
};

export default EditRequest;
