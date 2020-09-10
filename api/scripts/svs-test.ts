import config from '../src/config';
import { BodyType, default as CommonEmailService, Message, Options } from '../src/libs/service';

const main = async () => {
  const opts: Options = {
    uri: config.get('ches:ssoTokenURL'),
    grantType: config.get('ches:ssoGrantType'),
    clientId: config.get('ches:ssoClientId'),
    clientSecret: config.get('ches:ssoClientSecret'),
    baseURL: config.get('ches:baseURL'),
  };

  const ces = new CommonEmailService(opts)

  const message: Message = {
    bodyType: BodyType.Text,
    body: 'Hello World',
    to: [], // TODO: Set before use.
    from: '', // TODO: Set before use.
    subject: 'Test Message',
  }
  const reciept = await ces.send(message);
  console.log(reciept);

  // 422 Unprocessable Entity
  // If we don't wait for a short period.

  await new Promise((resolve, reject) => {
    console.log('Waiting 60sec for delivery.');
    setTimeout(async () => {
      console.log('Continuing.');

      const txStatus = await ces.transactionStatus(reciept.transactionId);
      console.log(txStatus);

      const msgStatus = await ces.messageStatus(reciept.messages[0].messageId);
      console.log(msgStatus);

      resolve();
    }, 60000);
  });
}

main();
