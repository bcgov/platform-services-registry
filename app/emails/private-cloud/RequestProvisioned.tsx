import * as React from 'react';
import { samplePrivateProduct } from '../_components/Params';
import ProvisionedTemplate from '../_templates/private-cloud/Provisioned';

export default function EditRequest() {
  return <ProvisionedTemplate product={samplePrivateProduct} />;
}
