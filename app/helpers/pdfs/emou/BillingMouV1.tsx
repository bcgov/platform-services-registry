import _sumBy from 'lodash-es/sumBy';
import { formatFullName } from '@/helpers/user';
import { Provider } from '@/prisma/client';
import { PublicCloudBillingDetailDecorated } from '@/types/public-cloud';
import { formatDate } from '@/utils/js';
import { Product } from './types';

export default function BillingMou({
  product,
  billing,
}: Readonly<{
  product: Product;
  billing: PublicCloudBillingDetailDecorated;
}>) {
  const isAWS = product.provider === Provider.AWS || product.provider === Provider.AWS_LZA;

  const service = isAWS ? 'AWS' : 'Microsoft Azure';

  return (
    <div>
      <div className="header">
        <div className="right">Printed on {formatDate(new Date())}</div>
      </div>
      <h1 className="text-center">Service Agreement</h1>
      <div className="">
        <p>This agreement is between;</p>
        <p className="text-center font-semibold">
          Connected Services BC
          <br />
          Hereby referred to as “the CSBC”
        </p>
        <p>And</p>
        <p className="text-center font-semibold">
          The {product.name}
          <br />
          Hereby referred to as “the Ministry”
        </p>

        <p>For the following services;</p>
        <p className="mb-2">
          &emsp;&emsp;Cloud compute, storage, and container management services, which will be accessible to the
          Ministry’s teams, on&nbsp;
          {isAWS ? 'the Amazon Web Services platform' : 'the Microsoft Azure platform'}, through the Government of
          Canada Cloud Brokering Service.
        </p>

        {isAWS ? (
          <p className="mb-2">
            &emsp;&emsp;AWS and the Government of Canada will invoice the CSBC, monthly, for the services consumed
            including the Provincial Sales Tax (PST). Additional charges include the 6% brokerage fee that covers the
            Government of Canada’s commission.
          </p>
        ) : (
          <p className="mb-2">
            &emsp;&emsp;Microsoft will invoice the CSBC, monthly, for the services consumed including the Provincial
            Sales Tax (PST). Additional charges include the 6% CSBC administrative fee.
          </p>
        )}

        <p className="mb-2">
          &emsp;&emsp;The CSBC will pass these costs through to the Ministry by Journal Voucher on a quarterly basis.
        </p>
        <p className="mb-2">
          &emsp;&emsp;This agreement also enables the Ministry’s Expense Authority approval for all actual consumed
          usage & any prepayment of reserved {service} services by the Ministry.
        </p>
        <p className="mb-2">
          The Ministry is responsible for understanding the cost structure associated with their current and future
          services consumption in {service} and monitoring their actual consumption to ensure it stays within the
          planned budget.
        </p>
        <p>
          This agreement will be in effect from the date of signing, until a written notification is provided to the
          CSBC, and/or the project is successfully offboarded, as described on the Public Cloud Accelerator{' '}
          <a
            href="https://digital.gov.bc.ca/cloud/services/public/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1"
          >
            service website.
          </a>
        </p>
      </div>

      <div className="break"></div>

      <p>The account coding for the CSBC is as follows;</p>

      <table>
        <tr>
          <th>Client Code</th>
          <td>RC</td>
          <td>SL</td>
          <td>STOB</td>
          <td>Project Code</td>
        </tr>
        <tr>
          <td>112</td>
          <td>32026</td>
          <td>34805</td>
          <td>6309</td>
          <td>3212604</td>
        </tr>
      </table>

      <p>The account coding for the Ministry is as follows;</p>

      <table>
        <tr>
          <td>Client Code</td>
          <td>RC</td>
          <td>SL</td>
          <td>STOB</td>
          <td>Project Code</td>
        </tr>
        <tr>
          <td>{billing.accountCoding.cc}</td>
          <td>{billing.accountCoding.rc}</td>
          <td>{billing.accountCoding.sl}</td>
          <td>{billing.accountCoding.stob}</td>
          <td>{billing.accountCoding.pc}</td>
        </tr>
      </table>

      <p>This agreement is signed on this day {formatDate(billing.signedAt, 'dd/MM/yy')} by</p>

      <table>
        <tr>
          <th colSpan={2}>The CSBC Citizen Service’s Expense Authority</th>
          <th colSpan={2}>The Ministry’s Expense Authority</th>
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
      </table>
    </div>
  );
}
