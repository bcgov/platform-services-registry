import { Provider } from '@prisma/client';
import _sumBy from 'lodash-es/sumBy';
import { formatFullName } from '@/helpers/user';
import { formatDate } from '@/utils/js';
import { Product, Billing } from './types';

export const css = `
@page {
  size: LETTER;
  margin: 0.5cm;

  @top-left {
    content: element(header);
  }

  @top-right {
    content: "Page " counter(page) " of " counter(pages);
    font-style: italic;
  }
}

* {
  font-family: "BCSans", sans-serif;
}

.break {
  page-break-before: always;
}

table {
  border-collapse: collapse;
  width: 100%;
}

td,
th {
  border: 1px solid #000;
  text-align: left;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #f4f4f4;
}

.header {
  position: running(header);
  font-style: italic;
}

.label {
  color: #6b6b6b;
}

.strong {
  font-weight: bold;
}

.mt-0 {
  margin-top: 0;
}

.text-center {
  text-align: center;
}

.font-semibold {
  font-weight: 600;
}

.mb-2 {
  margin-bottom: 0.5rem;
}
`;

function formatCurrency(value: number, { suffix = 'CAD' }: { suffix: 'CAD' | 'USD' }) {
  return `$${value.toFixed(2)} ${suffix}`;
}

export default function BillingMou({ product, billing }: { product: Product; billing: Billing }) {
  const values = [];
  if (product.environmentsEnabled.development) values.push(product.budget.dev);
  if (product.environmentsEnabled.test) values.push(product.budget.test);
  if (product.environmentsEnabled.production) values.push(product.budget.prod);
  if (product.environmentsEnabled.tools) values.push(product.budget.tools);

  const totalBudget = _sumBy(values, (val) => {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  });

  const isAWS = product.provider === Provider.AWS || product.provider === Provider.AWS_LZA;

  const currency = isAWS ? 'USD' : 'CAD';
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
          The Office of the Chief Information Officer
          <br />
          Hereby referred to as “the OCIO”
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
            &emsp;&emsp;AWS and the Government of Canada will invoice the OCIO, monthly, for the services consumed
            including the Provincial Sales Tax (PST). Additional charges include the 6% brokerage fee that covers the
            Government of Canada’s commission.
          </p>
        ) : (
          <p className="mb-2">
            &emsp;&emsp;Microsoft will invoice the OCIO, monthly, for the services consumed including the Provincial
            Sales Tax (PST). Additional charges include the 6% OCIO administrative fee.
          </p>
        )}

        <p className="mb-2">
          &emsp;&emsp;The OCIO will pass these costs through to the Ministry by Journal Voucher on a quarterly basis.
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
          OCIO, and/or the project is successfully offboarded, as described on the Public Cloud Accelerator
          <a
            href="https://digital.gov.bc.ca/cloud/services/public/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1"
          >
            &nbsp;service website.
          </a>
        </p>
      </div>

      <div className="break"></div>

      <p>The account coding for the OCIO is as follows;</p>

      <table>
        <tr>
          <td>Client Code</td>
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
          <td>{billing.accountCoding.substring(0, 3)}</td>
          <td>{billing.accountCoding.substring(3, 8)}</td>
          <td>{billing.accountCoding.substring(8, 13)}</td>
          <td>{billing.accountCoding.substring(13, 17)}</td>
          <td>{billing.accountCoding.substring(17, 24)}</td>
        </tr>
      </table>

      <p>This agreement is signed on this day {formatDate(billing.signedAt, 'dd/MM/yy')} by</p>

      <table>
        <tr>
          <td colSpan={2}>The OCIO Citizen Service’s Expense Authority</td>
          <td colSpan={2}>The Ministry’s Expense Authority</td>
        </tr>
        <tr>
          <td>Name</td>
          <td>{formatFullName(billing.signedBy)}</td>
          <td>Name</td>
          <td>{formatFullName(billing.approvedBy)}</td>
        </tr>
        <tr>
          <td>Position Title</td>
          <td>{billing.signedBy?.jobTitle || ''}</td>
          <td>Position Title</td>
          <td>{billing.approvedBy?.jobTitle || ''}</td>
        </tr>
        <tr>
          <td>Branch</td>
          <td>{billing.signedBy?.officeLocation || ''}</td>
          <td>Branch</td>
          <td>{billing.approvedBy?.officeLocation || ''}</td>
        </tr>
      </table>
    </div>
  );
}
