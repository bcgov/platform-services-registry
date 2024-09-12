import * as React from 'react';
import { samplePublicRequest } from '../_components/Params';
import ExpenseAuthorityMou from '../_templates/public-cloud/ExpenseAuthorityMou';

export default function PublicCloudExpenseAuthorityMou() {
  return <ExpenseAuthorityMou request={samplePublicRequest} />;
}
