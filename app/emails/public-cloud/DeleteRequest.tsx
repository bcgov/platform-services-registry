import * as React from 'react';
import { samplePublicProduct } from '../_components/Params';
import DeleteTemplate from '../_templates/public-cloud/DeleteRequest';

export default function DeleteRequest() {
  return <DeleteTemplate product={samplePublicProduct} userName={'User Session'} />;
}
