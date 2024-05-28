// import { connect, StringCodec } from "nats";
const { connect, StringCodec } = require('nats');

// const host = "nats://nats.platform-provisioner-dev.svc:4222";
// const host = "https://nats-dev-platform-provisioner-dev.apps.silver.devops.gov.bc.ca/";
// const host = "demo.nats.io:4222"
const host = `nats://localhost:4222`;

async function makeNats() {
  // to create a connection to a nats-server:
  const nc = await connect({ servers: host });

  // create a codec
  const sc = StringCodec();
  // create a simple subscriber and iterate over messages
  // matching the subscription
  const sub = nc.subscribe('hello');
  (async () => {
    for await (const m of sub) {
      console.log(`[${sub.getProcessed()}]: ${sc.decode(m.data)}`);
    }
    console.log('subscription closed');
  })();

  nc.publish('hello', sc.encode('world'));
  nc.publish('hello', sc.encode('again'));

  // // we want to insure that messages that are in flight
  // // get processed, so we are going to drain the
  // // connection. Drain is the same as close, but makes
  // // sure that all messages in flight get seen
  // // by the iterator. After calling drain on the connection
  // // the connection closes.
  // await nc.drain();
}

makeNats();
