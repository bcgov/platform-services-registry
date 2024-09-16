import * as React from 'react';
import { createSamplePublicCloudProduct } from '@/helpers/mock-resources/public-cloud-product';
import Template from '../_templates/public-cloud/DeleteApproval';

export default function DeleteCompletion() {
  const sampleProduct = createSamplePublicCloudProduct();
  return <Template product={sampleProduct} />;
}
