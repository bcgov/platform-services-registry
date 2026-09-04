import { convertCurrencyAmount } from './index';

describe('convertCurrencyAmount', () => {
  it('returns the same amount when currencies match, including cents', () => {
    expect(convertCurrencyAmount(12.34, 'CAD', 'CAD')).toBe(12.34);
  });

  it('converts USD to CAD without dropping cents on the input', () => {
    expect(convertCurrencyAmount(10.4, 'USD', 'CAD', 1.35)).toBe(14.04);
  });

  it('converts CAD to USD and rounds the result to cents', () => {
    expect(convertCurrencyAmount(13.5, 'CAD', 'USD', 1.35)).toBe(10);
  });
});
