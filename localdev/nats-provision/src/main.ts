import waitOn from 'wait-on';
import { connect, JSONCodec } from 'nats';
import { NATS_HOST, NATS_PORT, APP_URL } from './config.js';

const natsServer = `${NATS_HOST}:${NATS_PORT}`;

async function main() {
  console.log('Starting NATS Provision...');

  // Wait for NATS server to be available
  console.log('waiting for NATS server...', `tcp:${natsServer}`);
  await waitOn({
    resources: [`tcp:${natsServer}`],
    delay: 1000,
    window: 5000,
  });

  // Wait for the application URL to be available
  console.log('waiting for application URL...', APP_URL);
  await waitOn({
    resources: [APP_URL],
    delay: 1000,
    window: 100000,
  });

  const nc = await connect({ servers: natsServer });
  const jc = JSONCodec();

  // Subscribe to NATS topics for private cloud provisioning
  const privateProms = ['clab', 'klab', 'silver', 'gold', 'golddr', 'klab2', 'emerald'].map((cluster) => {
    const privateCloudSub = nc.subscribe(`registry_project_provisioning_${cluster}`);
    return (async () => {
      for await (const m of privateCloudSub) {
        const data: any = jc.decode(m.data);
        console.log(`Received: ${JSON.stringify(data)}`);

        try {
          const res = await fetch(`${APP_URL}/api/private-cloud/provision/${data.licencePlate}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          });
          console.log('Response sent:', res.status);
        } catch (error) {
          console.error('Error:', error);
        }
      }
    })();
  });

  // Subscribe to NATS topics for public cloud provisioning
  const publicProms = ['aws', 'azure'].map((provider) => {
    const publicCloudSub = nc.subscribe(`registry_project_provisioning_${provider}`);
    return (async () => {
      for await (const m of publicCloudSub) {
        const data: any = jc.decode(m.data);
        console.log(`Received: ${JSON.stringify(data)}`);

        try {
          const res = await fetch(`${APP_URL}/api/public-cloud/provision/${data.project_set_info.licence_plate}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          });
          console.log(res);
        } catch (error) {
          console.error(error);
        }
      }
    })();
  });

  // Monitor all subscriptions
  console.log('Monitoring all subscriptions');

  await Promise.all([...privateProms, ...publicProms]);
}

main().then(console.log).catch(console.error);
