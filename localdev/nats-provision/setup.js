import waitOn from 'wait-on';
import { connect, JSONCodec } from 'nats';

const natsServer = `${process.env.NATS_HOST}:${process.env.NATS_PORT}`;

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
  console.log('waiting for application URL...', process.env.APP_URL);
  await waitOn({
    resources: [process.env.APP_URL],
    delay: 1000,
    window: 100000,
  });

  const nc = await connect({ servers: natsServer });
  const jc = JSONCodec();

  // Subscribe to NATS topics for private cloud provisioning
  const proms = ['clab', 'klab', 'silver', 'gold', 'golddr', 'klab2', 'emerald'].map((cluster) => {
    const privateCloudSub = nc.subscribe(`registry_project_provisioning_${cluster}`);
    return (async () => {
      for await (const m of privateCloudSub) {
        const data = jc.decode(m.data);
        console.log(`Received: ${JSON.stringify(data)}`);

        try {
          const res = await fetch(`${process.env.APP_URL}/api/private-cloud/provision/${data.licencePlate}`, {
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

  // Subscribe to NATS topic for public cloud provisioning
  const publicCloudSub = nc.subscribe('registry_project_provisioning_aws');
  proms.push(
    (async () => {
      for await (const m of publicCloudSub) {
        const data = jc.decode(m.data);
        console.log(`Received: ${JSON.stringify(data)}`);

        try {
          const res = await fetch(
            `${process.env.APP_URL}/api/public-cloud/provision/${data.project_set_info.licence_plate}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({}),
            },
          );
          console.log(res);
        } catch (error) {
          console.error(error);
        }
      }
    })(),
  );

  // Monitor all subscriptions
  console.log('Monitoring all subscriptions');

  await Promise.all(proms);
}

main().then(console.log).catch(console.error);
