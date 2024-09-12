import * as React from 'react';
import { samplePublicProduct } from '../_components/Params';
import ProvisionedTemplate from '../_templates/public-cloud/Provisioned';

export default function EditRequest() {
  return <ProvisionedTemplate product={samplePublicProduct} />;
}
