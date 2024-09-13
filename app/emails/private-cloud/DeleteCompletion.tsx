import * as React from 'react';
import { createSamplePrivateCloudProduct } from '@/helpers/mock-resources/private-cloud-product';
import Template from '../_templates/private-cloud/DeleteApproval';

export default function DeleteCompletion() {
  const sampleProduct = createSamplePrivateCloudProduct();
  return <Template product={sampleProduct} />;
}
