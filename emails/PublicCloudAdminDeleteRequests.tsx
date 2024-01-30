import * as React from 'react';
import { samplePublicRequest } from './_components/Params';
import NewDeleteRequestTemplate from './_templates/public-cloud/AdminDeleteRequest';

export const NewRequest = () => {
  // Assuming samplePublicRequest has a requestedProject property of the correct type
  const product = samplePublicRequest.requestedProject;

  return <NewDeleteRequestTemplate product={product} />;
};

export default NewRequest;
