import { JSONCodec, connect } from 'nats';
import { logger } from '@/core/logging';

type NatsCredentials = {
  user?: string;
  pass?: string;
};

export async function sendNatsMessage(
  natsUrl: string,
  natsSubject: string,
  messageBody: any,
  credentials?: NatsCredentials,
) {
  logger.info('sending NATS', {
    details: {
      url: natsUrl,
      sub: natsSubject,
      msg: messageBody,
    },
  });

  if (Boolean(credentials?.user) !== Boolean(credentials?.pass)) {
    throw new Error('NATS username and password must both be provided');
  }

  const nc = await connect({
    servers: natsUrl,
    ...(credentials?.user && credentials?.pass ? { user: credentials.user, pass: credentials.pass } : {}),
  });

  // const sc = StringCodec();
  const jc = JSONCodec();

  nc.publish(natsSubject, jc.encode(messageBody));

  await nc.drain();
}
