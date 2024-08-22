import ObjectID from 'bson-objectid';

export function getBillingIdWhere(idOrAccountCoding: string) {
  const isObjectId = ObjectID.isValid(idOrAccountCoding);
  const billingWhereId = isObjectId ? { id: idOrAccountCoding } : { accountCoding: idOrAccountCoding };
  return billingWhereId;
}
