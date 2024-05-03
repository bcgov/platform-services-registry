export const up = async (db, client) => {
  const pipeline = [
    {
      $lookup: {
        from: 'PrivateCloudRequestedProject',
        localField: 'licencePlate',
        foreignField: 'licencePlate',
        as: 'relatedData',
      },
    },
    {
      $unwind: {
        path: '$relatedData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        'relatedData.updatedAt': 1,
      },
    },
    {
      $group: {
        _id: '$_id',
        firstRelatedData: { $first: '$relatedData' },
        doc: { $first: '$$ROOT' },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ['$doc', { originalDataId: '$firstRelatedData._id' }], // Add new field to the original document
        },
      },
    },
    // {
    //     $out: "PrivateCloudRequest",
    // },
  ];

  const result = await db.collection('PrivateCloudRequest').aggregate(pipeline).toArray();

  console.log('add_original_data_id_fields_private:', result.length);
};

export const down = async (db, client) => {};
