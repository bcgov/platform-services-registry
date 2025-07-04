import React from 'react';
import { YearlyCost } from '@/types/private-cloud';
import { formatCurrency } from '@/utils/js';

export default function YearlyCostSummary({ data }: { data: YearlyCost }) {
  return (
    <div className="border border-gray-200 border-solid rounded p-4 grid grid-cols-2 gap-4 bg-gray-50 my-6">
      <div>
        <strong>Account Coding:</strong> {data.accountCoding}
      </div>
      <div>
        <strong>Billing Period:</strong> {data.billingPeriod}
      </div>
      {data.currentTotal !== -1 && (
        <div>
          <strong>Current Total:</strong> {formatCurrency(data.currentTotal)}
        </div>
      )}
      {data.estimatedGrandTotal !== -1 && (
        <div>
          <strong>Estimated Grand Total:</strong> {formatCurrency(data.estimatedGrandTotal)}
        </div>
      )}
      {data.grandTotal !== -1 && (
        <div>
          <strong>Grand Total:</strong> {formatCurrency(data.grandTotal)}
        </div>
      )}
    </div>
  );
}
