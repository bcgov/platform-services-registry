export const up = async (db, client) => {
  const requests = await db
    .collection('PublicCloudRequest')
    .find(
      { type: 'CREATE' },
      {
        projection: { decisionDataId: 1 },
        sort: { createdAt: 1 },
      },
    )
    .toArray();

  for (let x = 0; x < requests.length; x++) {
    const request = requests[x];
    if (!request.decisionDataId) continue;

    const decisionData = await db
      .collection('PublicCloudRequestedProject')
      .findOne({ _id: { $eq: request.decisionDataId } });
    if (!decisionData) continue;

    if (!decisionData.accountCoding) continue;

    let billingId = null;
    const code = `${decisionData.accountCoding}_${decisionData.provider}`;

    const billingDoc = await db.collection('Billing').findOne({ code: { $eq: code } });
    if (billingDoc) {
      billingId = billingDoc._id;
    } else {
      const billingData = {
        code,
        accountCoding: decisionData.accountCoding,
        expenseAuthorityId: decisionData.expenseAuthorityId,
        licencePlate: decisionData.licencePlate,
        signed: false,
        approved: false,
        createdAt: decisionData.createdAt,
        updatedAt: decisionData.createdAt,
      };
      const insertMeta = await db.collection('Billing').insertOne(billingData, {});
      billingId = insertMeta.insertedId;
    }

    await db
      .collection('PublicCloudRequestedProject')
      .updateMany({ licencePlate: { $eq: decisionData.licencePlate } }, { $set: { billingId } });
  }
};

export const down = async (db, client) => {};
