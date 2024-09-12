import * as React from 'react';
import { samplePrivateProduct } from '../_components/Params';
import EditRequestCompleteTemplate from '../_templates/private-cloud/EditRequestComplete';

export default function EditRequestComplete() {
  return <EditRequestCompleteTemplate product={samplePrivateProduct} />;
}
