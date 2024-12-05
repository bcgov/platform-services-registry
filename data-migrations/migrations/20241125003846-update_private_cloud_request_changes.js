export const up = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const PrivateCloudRequest = db.collection('PrivateCloudRequest');
    const q1 = PrivateCloudRequest.updateMany({ 'quotaUpgradeResourceDetailList.env': { $in: ['dev', 'prod'] } }, [
      {
        $set: {
          quotaUpgradeResourceDetailList: {
            $map: {
              input: '$quotaUpgradeResourceDetailList',
              as: 'item',
              in: {
                $mergeObjects: [
                  '$$item',
                  {
                    env: {
                      $switch: {
                        branches: [
                          { case: { $eq: ['$$item.env', 'dev'] }, then: 'development' },
                          { case: { $eq: ['$$item.env', 'prod'] }, then: 'production' },
                        ],
                        default: '$$item.env',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    ]);

    const q2 = PrivateCloudRequest.updateMany(
      { 'changes.parentPaths': { $in: ['developmentQuota', 'testQuota', 'productionQuota', 'toolsQuota'] } },
      [
        {
          $set: {
            'changes.parentPaths': {
              $concatArrays: [
                {
                  $filter: {
                    input: '$changes.parentPaths',
                    as: 'item',
                    cond: {
                      $not: {
                        $in: ['$$item', ['developmentQuota', 'testQuota', 'productionQuota', 'toolsQuota']],
                      },
                    },
                  },
                },
                ['resourceRequests'],
              ],
            },
          },
        },
      ],
    );

    await Promise.all([q1, q2]);
  });

  session.endSession();
};

export const down = async (db, client) => {};
