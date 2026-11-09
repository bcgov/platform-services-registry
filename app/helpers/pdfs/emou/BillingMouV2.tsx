import { formatFullName } from '@/helpers/user';
import { PublicCloudBillingDetailDecorated } from '@/types/public-cloud';
import { formatDate } from '@/utils/js';
import AgreementAppendixV2 from './AgreementAppendixV2';
import AgreementTermsV2 from './AgreementTermsV2';
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

      <table>
        <tbody>
          <tr>
            <th>Client Code</th>
            <th>RC</th>
            <th>SL</th>
            <th>STOB</th>
            <th>Project Code</th>
          </tr>
          <tr>
            <td>{billing.accountCoding.cc}</td>
            <td>{billing.accountCoding.rc}</td>
            <td>{billing.accountCoding.sl}</td>
            <td>{billing.accountCoding.stob}</td>
            <td>{billing.accountCoding.pc}</td>
          </tr>
        </tbody>
      </table>

      <p>This agreement is signed on {formatDate(billing.signedAt, 'dd/MM/yy')} by:</p>

      <table>
        <tbody>
          <tr>
            <th colSpan={2}>The Ministry of Citizens’ Services Expense Authority</th>
            <th colSpan={2}>The Requester’s Expense Authority</th>
          </tr>
          <tr>
            <td>Name</td>
            <td>{formatFullName(billing.approvedBy)}</td>
            <td>Name</td>
            <td>{formatFullName(billing.signedBy)}</td>
          </tr>
          <tr>
            <td>Position Title</td>
            <td>{billing.approvedBy?.jobTitle || ''}</td>
            <td>Position Title</td>
            <td>{billing.signedBy?.jobTitle || ''}</td>
          </tr>
          <tr>
            <td>Branch</td>
            <td>{billing.approvedBy?.officeLocation || ''}</td>
            <td>Branch</td>
            <td>{billing.signedBy?.officeLocation || ''}</td>
          </tr>
        </tbody>
      </table>

      <div className="break"></div>

      <AgreementAppendixV2 />
    </div>
  );
}
