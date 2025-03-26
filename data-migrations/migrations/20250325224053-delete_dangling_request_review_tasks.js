import { ObjectId } from 'mongodb';

export const up = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const Task = db.collection('Task');
    const PrivateCloudRequest = db.collection('PrivateCloudRequest');
    const PublicCloudRequest = db.collection('PublicCloudRequest');

    const targetTasks = await Task.find({
      type: { $in: ['REVIEW_PRIVATE_CLOUD_REQUEST', 'REVIEW_PUBLIC_CLOUD_REQUEST'] },
      status: 'ASSIGNED',
    }).toArray();

    const idsToDelete = [];
    for (const targetTask of targetTasks) {
      const { type, data } = targetTask;
      if (!data) continue;

      const { requestId } = data;
      const query = { _id: { $eq: new ObjectId(requestId) }, decisionStatus: { $eq: 'CANCELLED' } };

      if (type === 'REVIEW_PRIVATE_CLOUD_REQUEST') {
        const cancelledRequest = await PrivateCloudRequest.findOne(query);
        if (cancelledRequest) {
          idsToDelete.push(targetTask._id);
        }
      } else if (type === 'REVIEW_PUBLIC_CLOUD_REQUEST') {
        const cancelledRequest = await PublicCloudRequest.findOne(query);
        if (cancelledRequest) {
          idsToDelete.push(targetTask._id);
        }
      }
    }

    if (idsToDelete.length === 0) return;

    const result = await Task.deleteMany({ _id: { $in: idsToDelete } });
    console.log('delete_dangling_request_review_tasks:', result);
  });

  session.endSession();
};

export const down = async (db, client) => {};
