import { expect } from '@jest/globals';
import { parse } from 'csv-parse/sync';
import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { createSamplePrivateCloudProductData } from '@/helpers/mock-resources';
import { RequestType } from '@/prisma/client';
import { mockSessionByRole } from '@/services/api-test/core';
import { createPrivateCloudProduct } from '@/services/api-test/private-cloud/products';
import { downloadPrivateCloudRequests } from '@/services/api-test/private-cloud/requests';

type RequestCsvRecord = {
  'Licence Plate': string;
  'Request Type': string;
  Status: string;
  'Created At': string;
  'Updated At': string;
  'Quota Changed': string;
};

describe('Download Private Cloud Requests', () => {
  beforeEach(async () => {
    await mockSessionByRole(GlobalRole.Admin);
  });

  beforeAll(async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const requests = [
      {
        quotaChanged: false,
        quotaIncrease: false,
      },
      {
        quotaChanged: true,
        quotaIncrease: true,
      },
      {
        quotaChanged: true,
        quotaIncrease: false,
      },
    ];

    for (const item of requests) {
      const productData = createSamplePrivateCloudProductData();

      const res = await createPrivateCloudProduct(productData);
      expect(res.status).toBe(200);

      const request = await res.json();

      if (item.quotaChanged) {
        await prisma.privateCloudRequest.update({
          where: { id: request.id },
          data: {
            type: RequestType.EDIT,
            isQuotaChanged: true,
            changes: {
              quotasChanged: true,
              quotasIncrease: item.quotaIncrease,
            },
          },
        });
      }
    }
  });
  it('should download requests as CSV', async () => {
    const res = await downloadPrivateCloudRequests({});

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/csv');

    const records = parse(await res.text(), {
      columns: true,
      skip_empty_lines: true,
    }) as RequestCsvRecord[];

    expect(records).toHaveLength(3);

    expect(records[0]).toEqual(
      expect.objectContaining({
        'Licence Plate': expect.any(String),
        'Request Type': expect.any(String),
        Status: expect.any(String),
        'Created At': expect.any(String),
        'Updated At': expect.any(String),
        'Quota Changed': expect.any(String),
      }),
    );
  });

  it('should return 204 when no requests match the filters', async () => {
    const res = await downloadPrivateCloudRequests({
      search: '______nonexistent______',
    });

    expect(res.status).toBe(204);
  });

  it('should reject an invalid cluster', async () => {
    const res = await downloadPrivateCloudRequests({
      clusters: ['INVALID' as never],
    });

    expect(res.status).toBe(400);
  });
  it('should download only quota change requests', async () => {
    const res = await downloadPrivateCloudRequests({
      quotaChange: true,
    });

    expect(res.status).toBe(200);

    const records = parse(await res.text(), {
      columns: true,
      skip_empty_lines: true,
    }) as RequestCsvRecord[];
    expect(records).toHaveLength(2);
    expect(records.every((record) => record['Quota Changed'] === 'YES')).toBe(true);
  });

  it('should apply quota change and request type filters together', async () => {
    const res = await downloadPrivateCloudRequests({
      quotaChange: true,
      types: [RequestType.EDIT],
    });

    expect(res.status).toBe(200);

    const records = parse(await res.text(), {
      columns: true,
      skip_empty_lines: true,
    }) as RequestCsvRecord[];

    expect(records).toHaveLength(2);

    expect(
      records.every((record) => record['Quota Changed'] === 'YES' && record['Request Type'] === RequestType.EDIT),
    ).toBe(true);
  });

  it('should download only quota increase requests', async () => {
    const res = await downloadPrivateCloudRequests({
      quotaIncrease: true,
    });

    expect(res.status).toBe(200);

    const records = parse(await res.text(), {
      columns: true,
      skip_empty_lines: true,
    }) as RequestCsvRecord[];

    expect(records).toHaveLength(1);
    expect(records[0]['Quota Changed']).toBe('YES');
    expect(records[0]['Request Type']).toBe(RequestType.EDIT);
  });
});
