const BATCH_SIZE = 100;

const environments = ['development', 'test', 'production', 'tools'];
const resources = ['cpu', 'memory', 'storage', 'gpu'];

function getQuotaIncrease(original, decision) {
  if (!original || !decision) return null;

  let changed = false;
  let increased = false;

  for (const env of environments) {
    for (const resource of resources) {
      const oldValue = original[env]?.[resource];
      const newValue = decision[env]?.[resource];

      if (
        typeof oldValue !== 'number' ||
        typeof newValue !== 'number' ||
        !Number.isFinite(oldValue) ||
        !Number.isFinite(newValue)
      ) {
        return null;
      }

      if (newValue !== oldValue) changed = true;
      if (newValue > oldValue) increased = true;
    }
  }

  return changed ? increased : null;
}

export const up = async (db, client) => {
  const Requests = db.collection('PrivateCloudRequest');
  const session = client.startSession();

  try {
    const requests = await Requests.aggregate([
      {
        $match: {
          type: 'EDIT',
          isQuotaChanged: true,
        },
      },
      {
        $lookup: {
          from: 'PrivateCloudRequestData',
          localField: 'originalDataId',
          foreignField: '_id',
          as: 'originalData',
        },
      },
      {
        $lookup: {
          from: 'PrivateCloudRequestData',
          localField: 'decisionDataId',
          foreignField: '_id',
          as: 'decisionData',
        },
      },
      {
        $project: {
          changes: 1,
          originalQuotas: {
            $arrayElemAt: ['$originalData.resourceRequests', 0],
          },
          newQuotas: {
            $arrayElemAt: ['$decisionData.resourceRequests', 0],
          },
        },
      },
    ]).toArray();

    const updates = [];

    const stats = {
      scanned: requests.length,
      alreadyCorrect: 0,
      cannotVerify: 0,
      noQuotaDifference: 0,
      toUpdate: 0,
    };

    for (const request of requests) {
      const original = request.originalQuotas;
      const decision = request.newQuotas;

      const actualIncrease = getQuotaIncrease(original, decision);

      if (actualIncrease === null) {
        if (!original || !decision) {
          stats.cannotVerify++;
        } else {
          let valid = true;
          let changed = false;

          for (const env of environments) {
            for (const resource of resources) {
              const oldValue = original[env]?.[resource];
              const newValue = decision[env]?.[resource];

              if (
                typeof oldValue !== 'number' ||
                typeof newValue !== 'number' ||
                !Number.isFinite(oldValue) ||
                !Number.isFinite(newValue)
              ) {
                valid = false;
              } else if (oldValue !== newValue) {
                changed = true;
              }
            }
          }

          if (!valid) stats.cannotVerify++;
          else if (!changed) stats.noQuotaDifference++;
        }

        continue;
      }

      if (request.changes?.quotasIncrease === actualIncrease) {
        stats.alreadyCorrect++;
        continue;
      }

      updates.push({
        updateOne: {
          filter: { _id: request._id },
          update: {
            $set: {
              ...(request.changes && typeof request.changes === 'object' && !Array.isArray(request.changes)
                ? {
                    'changes.quotasIncrease': actualIncrease,
                  }
                : {
                    changes: {
                      quotasIncrease: actualIncrease,
                    },
                  }),
            },
          },
        },
      });
    }

    stats.toUpdate = updates.length;

    console.log('backfill_quota_increase: Analysis:', stats);

    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
      const batch = updates.slice(i, i + BATCH_SIZE);

      await session.withTransaction(async () => {
        const result = await Requests.bulkWrite(batch, {
          ordered: true,
          session,
        });

        if (result.matchedCount !== batch.length) {
          throw new Error(`Expected ${batch.length} matches, got ${result.matchedCount}`);
        }
      });
    }

    console.log(`backfill_quota_increase: Updated ${updates.length} requests.`);
  } catch (error) {
    console.error('backfill_quota_increase: Migration failed:', error);
    throw error;
  } finally {
    await session.endSession();
  }
};

export const down = async () => {
  throw new Error('DEVXT-3231 cannot be automatically rolled back. Restore from a database backup if necessary.');
};
