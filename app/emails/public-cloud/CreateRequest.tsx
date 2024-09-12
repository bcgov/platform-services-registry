import * as React from 'react';
import { samplePublicRequest } from '../_components/Params';
import NewRequestTemplate from '../_templates/public-cloud/CreateRequest';

export default function NewRequest() {
  return <NewRequestTemplate request={samplePublicRequest} userName={'User Session'} />;
}
