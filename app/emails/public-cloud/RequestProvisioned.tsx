import * as React from 'react';
import { createSamplePublicCloudProduct } from '@/helpers/mock-resources/public-cloud-product';
import Template from '../_templates/public-cloud/Provisioned';

export default function RequestProvisioned() {
  const sampleProduct = createSamplePublicCloudProduct();
  return <Template product={sampleProduct} />;
}
