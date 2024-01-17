import * as React from 'react';
import { samplePublicProduct } from './components/Params';
import DeleteTemplate from './templates/public-cloud/DeleteRequest';

export const DeleteRequest = () => {
  return <DeleteTemplate product={samplePublicProduct} />;
};

export default DeleteRequest;
