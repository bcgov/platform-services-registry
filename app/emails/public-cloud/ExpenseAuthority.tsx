import * as React from 'react';
import { samplePublicProduct } from '../_components/Params';
import ExpenseAuthority from '../_templates/public-cloud/ExpenseAuthority';

export default function PublicCloudExpenseAuthority() {
  return <ExpenseAuthority product={samplePublicProduct} />;
}
