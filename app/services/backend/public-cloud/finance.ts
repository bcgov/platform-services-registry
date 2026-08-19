import axios from 'axios';
import { downloadFile } from '@/utils/browser';
import { instance as parentInstance } from './instance';

export const financeInstance = axios.create({
  ...parentInstance.defaults,
  baseURL: `${parentInstance.defaults.baseURL}/finance`,
});

export async function getFinanceSnapshot(provider: string = 'ALL') {
  return financeInstance.get('/snapshot', { params: { provider } }).then((res) => res.data);
}

export async function getFinanceRankings(params: {
  provider?: string;
  organizationId?: string;
  period?: string;
  limit?: number;
}) {
  return financeInstance.get('/rankings', { params }).then((res) => res.data);
}

export async function getFinanceCoverage() {
  return financeInstance.get('/coverage').then((res) => res.data);
}

export async function getFinanceAnomalies(includeReviewed = false) {
  return financeInstance
    .get('/anomalies', { params: { includeReviewed: includeReviewed ? 'true' : 'false' } })
    .then((res) => res.data);
}

export async function reviewFinanceAnomaly(id: string, reviewNote: string) {
  return financeInstance.post(`/anomalies/${id}/review`, { reviewNote }).then((res) => res.data);
}

export async function getFinanceUnmatched(params?: { provider?: string; year?: number; month?: number }) {
  return financeInstance.get('/unmatched', { params }).then((res) => res.data);
}

export async function resolveFinanceUnmatched(id: string, licencePlate: string) {
  return financeInstance.post(`/unmatched/${id}/resolve`, { licencePlate }).then((res) => res.data);
}

export async function downloadFinanceExport(params: {
  format?: 'csv' | 'xlsx';
  provider?: string;
  period?: string;
  datasets?: string;
}) {
  const format = params.format ?? 'xlsx';
  const result = await financeInstance
    .get('/export', { params: { ...params, format }, responseType: 'blob' })
    .then((res) => {
      if (res.status === 204) return false;
      const ext = format === 'csv' ? 'csv' : 'xlsx';
      downloadFile(res.data, `public-cloud-finance.${ext}`, res.headers);
      return true;
    });
  return result;
}

export async function getProductFinanceDetail(licencePlate: string) {
  return parentInstance.get(`/products/${licencePlate}/finance`).then((res) => res.data);
}

export async function createProductVarianceNote(
  licencePlate: string,
  body: { year: number; month: number; body: string; supersedesNoteId?: string },
) {
  return parentInstance.post(`/products/${licencePlate}/finance/variance-notes`, body).then((res) => res.data);
}
