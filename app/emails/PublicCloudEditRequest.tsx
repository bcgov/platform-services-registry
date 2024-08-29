import * as React from 'react';
import { samplePublicRequest } from './_components/Params';
import EditSummaryTemplate from './_templates/public-cloud/EditSummary';

export default function EditRequest() {
  return <EditSummaryTemplate request={samplePublicRequest} userName={'User Session'} />;
}
