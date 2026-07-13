import { convertUsdToCad, formatUsdCadRate, getUsdToCadRate, providerReportsActualsInUsd } from './usd-cad-fx';

describe('usd-cad-fx', () => {
  const june2026 = new Date(2026, 5, 15);

  it('returns known actual rates for closed months', () => {
    const rate = getUsdToCadRate(2026, 4, june2026);
    expect(rate.status).toBe('actual');
    expect(rate.rate).toBe(1.39);
  });

  it('returns tentative rates for current and future months', () => {
    const rate = getUsdToCadRate(2026, 6, june2026);
    expect(rate.status).toBe('tentative');
    expect(rate.rate).toBeGreaterThan(1);
  });

  it('converts USD amounts to CAD', () => {
    expect(convertUsdToCad(1000, 2026, 4, june2026)).toBe(1390);
  });

  it('formats rates to four decimals', () => {
    expect(formatUsdCadRate(1.39)).toBe('1.3900');
  });

  it('identifies AWS providers that report actuals in USD', () => {
    expect(providerReportsActualsInUsd('AWS')).toBe(true);
    expect(providerReportsActualsInUsd('AWS_LZA')).toBe(true);
    expect(providerReportsActualsInUsd('AZURE')).toBe(false);
  });
});
