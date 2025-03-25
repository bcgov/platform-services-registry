export const up = async (db, client) => {
  const args = [
    { environmentsEnabled: { $exists: false } },
    [
      {
        $set: {
          environmentsEnabled: {
            production: true,
            development: true,
            test: true,
            tools: true,
          },
        },
      },
    ],
  ];

  const prom1 = db.collection('PublicCloudProject').updateMany(...args);
  const prom2 = db.collection('PublicCloudRequestedProject').updateMany(...args);

  const result = await Promise.all([prom1, prom2]);

  console.log('populate_environments_enabled:', result);
};

export const down = async (db, client) => {};
