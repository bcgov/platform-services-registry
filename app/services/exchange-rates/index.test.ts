import { convertCurrencyAmount } from './index';

describe('convertCurrencyAmount', () => {
  it('returns the same amount when currencies match', () => {
    expect(convertCurrencyAmount(9700.4, 'CAD', 'CAD')).toBe(9700);
    expect(convertCurrencyAmount(100, 'USD', 'USD')).toBe(100);
  });

  it('returns zero without requiring a rate', () => {
    expect(convertCurrencyAmount(0, 'USD', 'CAD')).toBe(0);
    expect(convertCurrencyAmount(0, 'CAD', 'USD')).toBe(0);
  });

  it('converts USD to CAD with an FX rate', () => {
    expect(convertCurrencyAmount(9700, 'USD', 'CAD', 1.4)).toBe(13580);
  });

  it('converts CAD to USD with an FX rate', () => {
    expect(convertCurrencyAmount(1400, 'CAD', 'USD', 1.4)).toBe(1000);
  });

  it('requires a rate for non-zero cross-currency conversion', () => {
    expect(() => convertCurrencyAmount(100, 'USD', 'CAD')).toThrow(/exchange rate is required/);
  });
});
