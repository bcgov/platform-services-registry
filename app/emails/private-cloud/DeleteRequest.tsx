import * as React from 'react';
import { samplePrivateRequest } from '../_components/Params';
import DeleteTemplate from '../_templates/private-cloud/DeleteRequest';

export default function DeleteRequest() {
  return <DeleteTemplate request={samplePrivateRequest} userName={'User Session'} />;
}
