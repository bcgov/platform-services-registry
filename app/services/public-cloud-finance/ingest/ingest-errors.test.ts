import { ingestFailureMessage, isClientIngestError } from './ingest-errors';

describe('ingest error classification', () => {
  it('treats classic AWS and lock conflicts as client errors', () => {
    expect(
      isClientIngestError(new Error('Classic AWS ingest is not supported for real billing data. Use AWS_LZA.')),
    ).toBe(true);
    expect(isClientIngestError(new Error('Ingest already running for AWS_LZA 2026-7'))).toBe(true);
    expect(
      isClientIngestError(
        new Error('Scoped AWS_LZA ingest resolved no billing account IDs for the given licence plates.'),
      ),
    ).toBe(true);
  });

  it('treats credential and network failures as server errors', () => {
    expect(isClientIngestError(new Error('Unable to acquire Azure management token'))).toBe(false);
    expect(isClientIngestError(new Error('Cost Explorer returned no non-zero rows'))).toBe(false);
    expect(ingestFailureMessage('boom')).toBe('Ingest failed');
  });
});
