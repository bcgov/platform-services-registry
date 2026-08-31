import { Prisma } from '@/prisma/client';

const CLIENT_INGEST_ERROR = /Classic AWS ingest is not supported/;
const UNIQUE_CONSTRAINT_ERROR = /E11000|unique constraint|duplicate key/i;
const ALREADY_RUNNING = /Ingest already running/;

export class IngestAlreadyRunningError extends Error {
  constructor(provider: string, year: number, month: number) {
    super(`Ingest already running for ${provider} ${year}-${month}`);
    this.name = 'IngestAlreadyRunningError';
  }
}

export function ingestFailureMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Ingest failed';
}

export function isClientIngestError(error: unknown) {
  return CLIENT_INGEST_ERROR.test(ingestFailureMessage(error));
}

export function isIngestAlreadyRunningError(error: unknown) {
  return error instanceof IngestAlreadyRunningError || ALREADY_RUNNING.test(ingestFailureMessage(error));
}

export function isUniqueConstraintError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return true;
  return UNIQUE_CONSTRAINT_ERROR.test(ingestFailureMessage(error));
}
