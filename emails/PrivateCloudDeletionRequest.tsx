import * as React from 'react';
import { samplePrivateProduct } from './components/Params';
import DeleteTemplate from './templates/private-cloud/DeleteRequest';

export const DeleteRequest = () => {
  return <DeleteTemplate product={samplePrivateProduct} />;
};

export default DeleteRequest;
