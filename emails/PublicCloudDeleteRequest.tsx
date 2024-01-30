import * as React from 'react';
import { samplePublicProduct } from './_components/Params';
import DeleteTemplate from './_templates/public-cloud/DeleteRequest';

export const DeleteRequest = () => {
  return <DeleteTemplate product={samplePublicProduct} />;
};

export default DeleteRequest;
