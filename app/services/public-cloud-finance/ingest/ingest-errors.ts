const CLIENT_INGEST_ERROR =
  /Classic AWS ingest is not supported|Ingest already running|resolved no billing account IDs/;

export function ingestFailureMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Ingest failed';
}

export function isClientIngestError(error: unknown) {
  return CLIENT_INGEST_ERROR.test(ingestFailureMessage(error));
}
