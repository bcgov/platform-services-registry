function extractNumbers(inputString) {
  if (!inputString) return [];

  const pattern = /\d+(?:_\d+)?/g;
  const matches = inputString.match(pattern);

  if (matches) {
    const numbers = matches.map((match) => parseFloat(match.replace(/_/g, '.')));
    return numbers;
  }

  return [];
}

export const up = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    await Promise.all(
      ['PrivateCloudProject', 'PrivateCloudRequestedProject'].map(async (collectionName) => {
        const coll = db.collection(collectionName);
        const privateCloudProducts = await coll
          .find({})
          .project({ _id: 1, developmentQuota: 1, testQuota: 1, productionQuota: 1, toolsQuota: 1 })
          .toArray();

        return Promise.all(
          privateCloudProducts.map(async (product) => {
            const devCpu = extractNumbers(product.developmentQuota.cpu);
            const devMemory = extractNumbers(product.developmentQuota.memory);
            const devStorage = extractNumbers(product.developmentQuota.storage);

            const testCpu = extractNumbers(product.testQuota.cpu);
            const testMemory = extractNumbers(product.testQuota.memory);
            const testStorage = extractNumbers(product.testQuota.storage);

            const prodCpu = extractNumbers(product.productionQuota.cpu);
            const prodMemory = extractNumbers(product.productionQuota.memory);
            const prodStorage = extractNumbers(product.productionQuota.storage);

            const toolsCpu = extractNumbers(product.toolsQuota.cpu);
            const toolsMemory = extractNumbers(product.toolsQuota.memory);
            const toolsStorage = extractNumbers(product.toolsQuota.storage);

            return coll.updateOne(
              { _id: { $eq: product._id } },
              {
                $set: {
                  resourceRequests: {
                    development: {
                      cpu: devCpu[0],
                      memory: devMemory[0],
                      storage: devStorage[0],
                    },
                    test: {
                      cpu: testCpu[0],
                      memory: testMemory[0],
                      storage: testStorage[0],
                    },
                    production: {
                      cpu: prodCpu[0],
                      memory: prodMemory[0],
                      storage: prodStorage[0],
                    },
                    tools: {
                      cpu: toolsCpu[0],
                      memory: toolsMemory[0],
                      storage: toolsStorage[0],
                    },
                  },
                },
              },
            );
          }),
        );
      }),
    );
  });

  session.endSession();
};

export const down = async (db, client) => {};
