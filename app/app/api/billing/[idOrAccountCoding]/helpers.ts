export function getBillingIdWhere(idOrAccountCoding: string, context?: string) {
  if (!context) {
    return { id: idOrAccountCoding };
  }

  const code = `${idOrAccountCoding}_${context}`;
  return { code };
}
