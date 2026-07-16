import { instance } from './axios';

export type UsdCadExchangeRateResponse = {
  rate: number;
  date: string;
  source: 'Bank of Canada';
};

/** Latest Bank of Canada daily average USD→CAD rate (cached server-side). */
export async function getUsdCadExchangeRate(): Promise<UsdCadExchangeRateResponse> {
  return instance.get('/exchange-rates/usd-cad').then((res) => res.data);
}
