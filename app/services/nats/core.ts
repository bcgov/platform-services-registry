import { JSONCodec, connect } from 'nats';
import { logger } from '@/core/logging';

export async function sendNatsMessage(natsUrl: string, natsSubject: string, messageBody: any) {
  logger.info('sending NATS', {
    details: {
      url: natsUrl,
      sub: natsSubject,
      msg: messageBody,
    },
  });

  const nc = await connect({ servers: natsUrl });

  // const sc = StringCodec();
  const jc = JSONCodec();

  nc.publish(natsSubject, jc.encode(messageBody));

  await nc.drain();
}
