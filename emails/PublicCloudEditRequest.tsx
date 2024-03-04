import * as React from 'react';
import { samplePublicEditRequest } from './_components/Params';
import EditSummaryTemplate from './_templates/public-cloud/EditSummary';

export default function EditRequest() {
  return <EditSummaryTemplate request={samplePublicEditRequest} />;
}
