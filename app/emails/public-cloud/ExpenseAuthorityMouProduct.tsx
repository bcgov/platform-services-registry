import * as React from 'react';
import { createSamplePublicCloudBilling } from '@/helpers/mock-resources/public-cloud-billing';
import { createSamplePublicCloudProduct } from '@/helpers/mock-resources/public-cloud-product';
import { PublicCloudBillingDetailDecorated } from '@/types/public-cloud';
import Template from '../_templates/public-cloud/ExpenseAuthorityMouProduct';

export default function ExpenseAuthorityMouProduct() {
  const sampleProduct = createSamplePublicCloudProduct();
  const sampleBilling = createSamplePublicCloudBilling();
  return <Template product={sampleProduct} billing={sampleBilling as PublicCloudBillingDetailDecorated} />;
}
