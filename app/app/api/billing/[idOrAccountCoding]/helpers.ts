import ObjectID from 'bson-objectid';

export function getBillingIdWhere(idOrAccountCoding: string) {
  const isPotentialObjectId = ObjectID.isValid(idOrAccountCoding);
  const billingWhereId = isPotentialObjectId
    ? { OR: [{ id: idOrAccountCoding }, { accountCoding: idOrAccountCoding }] }
    : { accountCoding: idOrAccountCoding };
  return billingWhereId;
}
