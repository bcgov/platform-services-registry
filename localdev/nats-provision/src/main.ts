import waitOn from 'wait-on';
import { connect, JSONCodec } from 'nats';
import {
  NATS_HOST,
  NATS_PORT,
  APP_URL,
  KEYCLOAK_URL,
  PUBLIC_CLOUD_REALM_NAME,
  PUBLIC_CLOUD_CLIENT_ID,
  PUBLIC_CLOUD_CLIENT_SECRET,
} from './config.js';
import { KcAdmin } from '../../_packages/keycloak-admin/src/main.js';

const natsServer = `${NATS_HOST}:${NATS_PORT}`;

async function main() {
  console.log('Starting NATS Provision...');

  // Wait for external services to be available
  console.log('waiting for NATS server...', `tcp:${natsServer}`);
  await waitOn({
    resources: [`tcp:${natsServer}`, `${KEYCLOAK_URL}/health/ready`, APP_URL],
    delay: 1000,
    window: 100000,
  });

  const nc = await connect({ servers: natsServer });
  const jc = JSONCodec();

  const kc = new KcAdmin({
    baseUrl: KEYCLOAK_URL,
    realmName: PUBLIC_CLOUD_REALM_NAME,
    clientId: PUBLIC_CLOUD_CLIENT_ID,
    clientSecret: PUBLIC_CLOUD_CLIENT_SECRET,
  });

  await kc.auth();

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

        const licencePlate = data.project_set_info.licence_plate;

        try {
          if (m.subject.endsWith('aws')) {
            const pgroup = await kc.createGroup(PUBLIC_CLOUD_REALM_NAME, 'Project Team Groups');
            const tgroup = await kc.createChildGroup(PUBLIC_CLOUD_REALM_NAME, pgroup?.id as string, licencePlate);
            await Promise.all(
              ['Admins', 'Viewers', 'Developers', 'SecurityAuditors', 'BillingViewers'].map((role) => {
                return kc.createChildGroup(PUBLIC_CLOUD_REALM_NAME, tgroup?.id as string, role);
              }),
            );
          }
        } catch {}

        try {
          const res = await fetch(`${APP_URL}/api/public-cloud/provision/${licencePlate}`, {
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
