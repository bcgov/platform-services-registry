import { Provider } from '@prisma/client';
import _sumBy from 'lodash-es/sumBy';
import { ministryKeyToName } from '@/helpers/product';
import { formatFullName } from '@/helpers/user';
import { formatDate } from '@/utils/date';
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

  const currency = product.provider === Provider.AWS ? 'USD' : 'CAD';

  return (
    <div>
      <div className="header">
        <div className="right">Printed on {formatDate(new Date())}</div>
      </div>
      <h1>Electronic Memorandum of Understanding (eMOU)</h1>
      <h3>Product description</h3>
      <div>
        <div className="label">Product name</div>
        <div>{product.name}</div>
        <br />
        <div className="label">Description</div>
        <div>{product.description}</div>
        <br />
        <div className="label">Ministry</div>
        <div>{ministryKeyToName(product.ministry)}</div>
        <br />
        <div className="label">Cloud service provider</div>
        <div>{product.provider}</div>
      </div>

      <br />

      <h3>Product budget (estimated average monthly spend)</h3>
      <table>
        {product.environmentsEnabled.development && (
          <tr>
            <td>Development account</td>
            <td>{formatCurrency(product.budget.dev, { suffix: currency })}</td>
          </tr>
        )}

        {product.environmentsEnabled.test && (
          <tr>
            <td>Development account</td>
            <td>{formatCurrency(product.budget.test, { suffix: currency })}</td>
          </tr>
        )}
        {product.environmentsEnabled.production && (
          <tr>
            <td>Development account</td>
            <td>{formatCurrency(product.budget.prod, { suffix: currency })}</td>
          </tr>
        )}
        {product.environmentsEnabled.tools && (
          <tr>
            <td>Development account</td>
            <td>{formatCurrency(product.budget.tools, { suffix: currency })}</td>
          </tr>
        )}
        <tr>
          <td>Total</td>
          <td>{formatCurrency(totalBudget, { suffix: currency })}</td>
        </tr>
      </table>

      {currency === 'CAD' ? (
        <p className="mt-0">
          <span className="strong">Note: </span>
          Additional taxes and fees may apply.
        </p>
      ) : (
        <p className="mt-0">
          <span className="strong">Note: </span>
          Additional taxes, fees, and USD currency conversion may apply.
        </p>
      )}

      <h3>Agreement</h3>
      <table>
        <tr>
          <td>Account coding</td>
          <td>{billing.accountCoding}</td>
        </tr>
        <tr>
          <td>Signed by (Team&apos;s Expense authority)</td>
          <td>{formatFullName(billing.signedBy)}</td>
        </tr>
        <tr>
          <td>Signed at</td>
          <td>{formatDate(billing.signedAt)}</td>
        </tr>
        <tr>
          <td>Approved by (OCIO Expense authority)</td>
          <td>{formatFullName(billing.approvedBy)}</td>
        </tr>
        <tr>
          <td>Approved at</td>
          <td>{formatDate(billing.approvedAt)}</td>
        </tr>
      </table>
    </div>
  );
}
