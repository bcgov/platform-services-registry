import { expect } from '@jest/globals';
import { parse } from 'csv-parse/sync';
import { GlobalRole } from '@/constants';
import { createSamplePublicCloudProductData } from '@/helpers/mock-resources';
import { RequestType } from '@/prisma/client';
import { mockSessionByRole } from '@/services/api-test/core';
import { createPublicCloudProduct } from '@/services/api-test/public-cloud/products';
import { downloadPublicCloudRequests } from '@/services/api-test/public-cloud/requests';

type RequestCsvRecord = {
  'Licence Plate': string;
  'Request Type': string;
  Status: string;
  'Created At': string;
  'Updated At': string;
};

describe('Download Public Cloud Requests', () => {
  beforeEach(async () => {
    await mockSessionByRole(GlobalRole.Admin);
  });

  beforeAll(async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const productData = createSamplePublicCloudProductData();
    const res = await createPublicCloudProduct(productData);

    expect(res.status).toBe(200);
  });

  it('should download requests as CSV', async () => {
    const res = await downloadPublicCloudRequests({});

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/csv');

    const records = parse(await res.text(), {
      columns: true,
      skip_empty_lines: true,
    }) as RequestCsvRecord[];

    expect(records).toHaveLength(1);
    expect(records[0]['Request Type']).toBe(RequestType.CREATE);

    expect(records[0]).toEqual(
      expect.objectContaining({
        'Licence Plate': expect.any(String),
        'Request Type': expect.any(String),
        Status: expect.any(String),
        'Created At': expect.any(String),
        'Updated At': expect.any(String),
      }),
    );
  });

  it('should return 204 when no requests match the filters', async () => {
    const res = await downloadPublicCloudRequests({
      search: '______nonexistent______',
    });

    expect(res.status).toBe(204);
  });

  it('should reject an invalid provider', async () => {
    const res = await downloadPublicCloudRequests({
      providers: ['INVALID' as never],
    });

    expect(res.status).toBe(400);
  });

  it('should download only CREATE requests', async () => {
    const res = await downloadPublicCloudRequests({
      types: [RequestType.CREATE],
    });

    expect(res.status).toBe(200);

    const records = parse(await res.text(), {
      columns: true,
      skip_empty_lines: true,
    }) as RequestCsvRecord[];

    expect(records).toHaveLength(1);
    expect(records[0]['Request Type']).toBe(RequestType.CREATE);
  });
});
