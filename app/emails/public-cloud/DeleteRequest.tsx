import * as React from 'react';
import { getRandomUser } from '@/helpers/mock-resources/core';
import { createSamplePublicCloudProduct } from '@/helpers/mock-resources/public-cloud-product';
import Template from '../_templates/public-cloud/DeleteRequest';

export default function DeleteRequest() {
  const sampleProduct = createSamplePublicCloudProduct();
  const sampleUser = getRandomUser();
  return <Template product={sampleProduct} userName={sampleUser.displayName} />;
}
