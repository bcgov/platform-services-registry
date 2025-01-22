import axios from 'axios';
import { logger } from '@/core/logging';
import prisma from '@/core/prisma';
import { generateHubSignatures, encodeBasicAuthorization } from '@/utils/node';

export async function sendWebhookMessage(licencePlate: string, data: any) {
  const webhookInfo = await prisma.privateCloudProductWebhook.findUnique({ where: { licencePlate } });
  if (!webhookInfo?.url) return null;

  let headers: Record<string, string> = {};
  if (webhookInfo.secret) {
    const signatures = generateHubSignatures(JSON.stringify(data), webhookInfo.secret);
    headers = {
      'X-Hub-Signature': signatures.sha1,
      'X-Hub-Signature-256': signatures.sha256,
    };
  }

  if (webhookInfo.username && webhookInfo.password) {
    const basicAuth = encodeBasicAuthorization(webhookInfo.username, webhookInfo.password);
    headers.Authorization = basicAuth;
  }

  return axios
    .post(webhookInfo.url, data, {
      signal: AbortSignal.timeout(5000),
      headers,
    })
    .catch((error) => logger.error(error));
}
