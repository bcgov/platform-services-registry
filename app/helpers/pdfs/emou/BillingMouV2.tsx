import { PublicCloudBillingDetailDecorated } from '@/types/public-cloud';
import { formatDate } from '@/utils/js';
import AgreementAppendixV2 from './AgreementAppendixV2';
import AgreementTermsV2 from './AgreementTermsV2';
import BillingAccountCoding from './BillingAccountCoding';
import BillingSignatures from './BillingSignatures';
import { Product } from './types';

export default function BillingMou({
  product,
  billing,
}: Readonly<{
  product: Product;
  billing: PublicCloudBillingDetailDecorated;
}>) {
  return (
    <div>
      <div className="header">
        <div className="right">Printed on {formatDate(new Date())}</div>
      </div>

      <h1 className="text-center">Service Agreement</h1>

      <AgreementTermsV2 name={product.name} provider={product.provider} />

      <div className="break"></div>

      <p>If you are a Schedule A client – please provide your coding below;</p>

      <BillingAccountCoding accountCoding={billing.accountCoding} />

      <p>This agreement is signed on {formatDate(billing.signedAt, 'dd/MM/yy')} by:</p>

      <BillingSignatures
        billing={billing}
        leftTitle="The Ministry of Citizens’ Services Expense Authority"
        rightTitle="The Requester’s Expense Authority"
      />

      <div className="break"></div>

      <AgreementAppendixV2 />
    </div>
  );
}
