export const up = async (db, client) => {
  const PublicCloudRequest = db.collection('PublicCloudRequest');
  const PublicCloudRequestedProject = db.collection('PublicCloudRequestedProject');

  const publicCloudRequests = await PublicCloudRequest.find({ originalDataId: { $exists: false } }).toArray();

  for (const publicCloudRequest of publicCloudRequests) {
    const licencePlateVal = publicCloudRequest.licencePlate;
    const publicCloudRequestCreated = new Date(publicCloudRequest.created.toISOString());

    const matchingPublicCloudRequestedProjects = await PublicCloudRequestedProject.find({
      licencePlate: licencePlateVal,
      created: { $lte: publicCloudRequestCreated },
    })
      .sort({ created: -1 })
      .toArray();
    if (matchingPublicCloudRequestedProjects) {
      await PublicCloudRequest.findOneAndUpdate(
        { _id: publicCloudRequest._id },
        { $set: { originalDataId: matchingPublicCloudRequestedProjects[0]._id } },
      );
    }
  }

  console.log('add_original_data_id_fields_public: Original data IDs have been updated successfully.');
};

export const down = async (db, client) => {};
