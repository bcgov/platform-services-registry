export const up = async (db, client) => {
  await db.collection('Billing').deleteMany({});

  const products = await db
    .collection('PublicCloudProject')
    .find(
      {},
      {
        projection: {
          provider: 1,
          accountCoding: 1,
          expenseAuthorityId: 1,
          licencePlate: 1,
          createdAt: 1,
          updatedAt: 1,
        },
        sort: { createdAt: 1 },
      },
    )
    .toArray();

  for (let x = 0; x < products.length; x++) {
    const product = products[x];
    if (!product.accountCoding) continue;

    let billingId = null;
    const code = `${product.accountCoding}_${product.provider}`;

    const billingDoc = await db.collection('Billing').findOne({ code: { $eq: code } });
    if (billingDoc) {
      billingId = billingDoc._id;
    } else {
      const billingData = {
        code,
        accountCoding: product.accountCoding,
        expenseAuthorityId: product.expenseAuthorityId,
        licencePlate: product.licencePlate,
        signed: false,
        approved: false,
        createdAt: product.createdAt,
        updatedAt: product.createdAt,
      };
      const insertMeta = await db.collection('Billing').insertOne(billingData, {});
      billingId = insertMeta.insertedId;
    }

    await db.collection('PublicCloudProject').updateOne({ _id: { $eq: product._id } }, { $set: { billingId } });

    await db
      .collection('PublicCloudRequestedProject')
      .updateMany({ licencePlate: { $eq: product.licencePlate } }, { $set: { billingId } });
  }

  // Remove invalid (dangling) documents
  await db.collection('PublicCloudRequestedProject').deleteMany({ billingId: { $exists: false } });
};

export const down = async (db, client) => {};
