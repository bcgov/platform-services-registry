import * as React from 'react';
import { samplePrivateProduct } from './_components/Params';
import DeleteTemplate from './_templates/private-cloud/DeleteRequest';

export default function DeleteRequest() {
  return <DeleteTemplate product={samplePrivateProduct} />;
}
