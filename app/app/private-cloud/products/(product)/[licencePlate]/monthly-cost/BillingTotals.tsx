import React from 'react';
import { formatCurrency } from '@/utils/js';

interface Props {
  accountCoding?: string;
  billingPeriod?: string;
  currentTotal?: number;
  estimatedGrandTotal?: number;
  grandTotal?: number;
}

export default function BillingTotals({
  accountCoding,
  billingPeriod,
  currentTotal = -1,
  estimatedGrandTotal = -1,
  grandTotal = -1,
}: Props) {
  return (
    <>
      {accountCoding && (
        <div>
          <strong>Account Coding:</strong> {accountCoding}
        </div>
      )}
      {billingPeriod && (
        <div>
          <strong>Billing Period:</strong> {billingPeriod}
        </div>
      )}
      {currentTotal !== -1 && (
        <div>
          <strong>Current Total:</strong> {formatCurrency(currentTotal)}
        </div>
      )}
      {estimatedGrandTotal !== -1 && (
        <div>
          <strong>Estimated Grand Total:</strong> {formatCurrency(estimatedGrandTotal)}
        </div>
      )}
      {grandTotal !== -1 && (
        <div>
          <strong>Grand Total:</strong> {formatCurrency(grandTotal)}
        </div>
      )}
    </>
  );
}
