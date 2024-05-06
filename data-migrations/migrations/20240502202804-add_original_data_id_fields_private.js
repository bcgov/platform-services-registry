export const up = async (db, client) => {
  const PrivateCloudRequest = db.collection('PrivateCloudRequest');
  const PrivateCloudRequestedProject = db.collection('PrivateCloudRequestedProject');

  const privateCloudRequests = await PrivateCloudRequest.find({ originalDataId: { $exists: false } }).toArray();

  for (const privateCloudRequest of privateCloudRequests) {
    const licencePlateVal = privateCloudRequest.licencePlate;
    const privateCloudRequestCreated = new Date(privateCloudRequest.created.toISOString());

    const matchingPrivateCloudRequestedProjects = await PrivateCloudRequestedProject.find({
      licencePlate: licencePlateVal,
      created: { $lte: privateCloudRequestCreated },
    })
      .sort({ created: -1 })
      .toArray();

    if (matchingPrivateCloudRequestedProjects) {
      await PrivateCloudRequest.findOneAndUpdate(
        { _id: privateCloudRequest._id },
        { $set: { originalDataId: matchingPrivateCloudRequestedProjects[0]._id } },
      );
    }
  }

  console.log('add_original_data_id_fields_private: Original data IDs have been updated successfully.');
};

export const down = async (db, client) => {};
