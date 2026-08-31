import { Prisma } from '@/prisma/client';
import {
  IngestAlreadyRunningError,
  ingestFailureMessage,
  isClientIngestError,
  isIngestAlreadyRunningError,
  isUniqueConstraintError,
} from './ingest-errors';

describe('ingest error classification', () => {
  it('treats classic AWS as a client error', () => {
    expect(
      isClientIngestError(new Error('Classic AWS ingest is not supported for real billing data. Use AWS_LZA.')),
    ).toBe(true);
    expect(
      isClientIngestError(
        new Error('Scoped AWS_LZA ingest resolved no billing account IDs for the given licence plates.'),
      ),
    ).toBe(false);
  });

  it('treats lock conflicts as 409, not 400', () => {
    const conflict = new IngestAlreadyRunningError('AWS_LZA', 2026, 7);
    expect(isIngestAlreadyRunningError(conflict)).toBe(true);
    expect(isClientIngestError(conflict)).toBe(false);
  });

  it('treats Prisma and Mongo unique failures as lock conflicts', () => {
    expect(
      isUniqueConstraintError(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '6.19.3',
        }),
      ),
    ).toBe(true);
    expect(isUniqueConstraintError(new Error('E11000 duplicate key error collection: pltsvc.IngestionLock'))).toBe(
      true,
    );
  });

  it('treats credential and network failures as server errors', () => {
    expect(isClientIngestError(new Error('Unable to acquire Azure management token'))).toBe(false);
    expect(isClientIngestError(new Error('Cost Explorer returned no non-zero rows'))).toBe(false);
    expect(ingestFailureMessage('boom')).toBe('Ingest failed');
  });
});
