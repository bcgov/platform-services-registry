export const roundNumber = (number: number, options?: { decimals?: number }) => {
  const { decimals = 2 } = options ?? {};
  return Number((Math.round(number * 100) / 100).toFixed(decimals));
};

export const formatNumber = (number: number, options?: { prefix?: string; suffix?: string; decimals?: number }) => {
  const { prefix = '', suffix = '', decimals = 2 } = options ?? {};
  const value = new Intl.NumberFormat('us').format(roundNumber(number, { decimals })).toString();
  return `${prefix}${value}${suffix}`;
};
