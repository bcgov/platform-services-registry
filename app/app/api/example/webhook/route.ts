import { NextRequest } from 'next/server';
import { logger } from '@/core/logging';
import { OkResponse } from '@/core/responses';
import { verifyHubSignature } from '@/utils/node';

const secret = 'pltsvc'; // pragma: allowlist secret

export async function POST(req: NextRequest) {
  const headers = req.headers;
  const sha1sig = headers.get('x-hub-signature');
  const sha256sig = headers.get('x-hub-signature-256');
  const authorization = headers.get('authorization');

  const data = await req.json();

  if (authorization) {
    const base64Credentials = authorization.substring(6);
    const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = decodedCredentials.split(':');
    logger.info(`Authorization header found; username: ${username}; password: ${password}`);
  }

  if (sha1sig && sha256sig) {
    const json = JSON.stringify(data);
    const sha1ver = verifyHubSignature(json, secret, sha1sig);
    const sha256ver = verifyHubSignature(json, secret, sha256sig);

    const info = { data, sha1ver, sha256ver };
    logger.info(JSON.stringify(info));
  }

  return OkResponse(true);
}
