export const ProductBiliingStatus = {
  NO_BILLING: 'no-billing',
  PENDING: 'pending',
  COMPLETED: 'completed',
};

export type ProductBiliingStatus = (typeof ProductBiliingStatus)[keyof typeof ProductBiliingStatus];
