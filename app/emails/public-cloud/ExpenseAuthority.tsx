import * as React from 'react';
import { createSamplePublicCloudProduct } from '@/helpers/mock-resources/public-cloud-product';
import Template from '../_templates/public-cloud/ExpenseAuthority';

export default function ExpenseAuthority() {
  const sampleProduct = createSamplePublicCloudProduct();
  return <Template product={sampleProduct} />;
}
