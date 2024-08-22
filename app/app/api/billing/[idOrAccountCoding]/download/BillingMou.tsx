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
`;

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

  return (
    <div>
      <div className="header">
        <div className="right">Printed on {formatDate(new Date())}</div>
      </div>
      <h1>Electronic Memorandum of Understanding (eMOU)</h1>
      <h3>Product Description</h3>
      <div>
        <div className="label">Product Name</div>
        <div>{product.name}</div>
        <br />
        <div className="label">Description</div>
        <div>{product.description}</div>
        <br />
        <div className="label">Ministry</div>
        <div>{ministryKeyToName(product.ministry)}</div>
        <br />
        <div className="label">Cloud Service Provider</div>
        <div>{product.provider}</div>
      </div>

      <br />

      <h3>Product Budget (Estimated average monthly spend)</h3>
      <table>
        {product.environmentsEnabled.development && (
          <tr>
            <td>Development Account</td>
            <td>{product.budget.dev.toFixed(2)}</td>
          </tr>
        )}

        {product.environmentsEnabled.test && (
          <tr>
            <td>Development Account</td>
            <td>{product.budget.test.toFixed(2)}</td>
          </tr>
        )}
        {product.environmentsEnabled.production && (
          <tr>
            <td>Development Account</td>
            <td>{product.budget.prod.toFixed(2)}</td>
          </tr>
        )}
        {product.environmentsEnabled.tools && (
          <tr>
            <td>Development Account</td>
            <td>{product.budget.tools.toFixed(2)}</td>
          </tr>
        )}
        <tr>
          <td>Total</td>
          <td>{totalBudget.toFixed(2)}</td>
        </tr>
      </table>

      <h3>Agreement</h3>
      <table>
        <tr>
          <td>Account Coding</td>
          <td>{billing.accountCoding}</td>
        </tr>
        <tr>
          <td>Signed By</td>
          <td>{formatFullName(billing.signedBy)}</td>
        </tr>
        <tr>
          <td>Signed At</td>
          <td>{formatDate(billing.signedAt)}</td>
        </tr>
        <tr>
          <td>Approved By</td>
          <td>{formatFullName(billing.approvedBy)}</td>
        </tr>
        <tr>
          <td>Approved At</td>
          <td>{formatDate(billing.approvedAt)}</td>
        </tr>
      </table>
    </div>
  );
}
