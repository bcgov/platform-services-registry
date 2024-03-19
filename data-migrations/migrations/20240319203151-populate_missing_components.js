export const up = async (db, client) => {
  const defaultComponentValue = {
    planningToUse: false,
    implemented: false,
  };

  async function update(collectionName) {
    [
      'commonComponents.addressAndGeolocation',
      'commonComponents.workflowManagement',
      'commonComponents.formDesignAndSubmission',
      'commonComponents.identityManagement',
      'commonComponents.paymentServices',
      'commonComponents.documentManagement',
      'commonComponents.endUserNotificationAndSubscription',
      'commonComponents.publishing',
      'commonComponents.businessIntelligence',
    ].map(async (key) => {
      await db
        .collection(collectionName)
        .updateMany({ [key]: { $exists: false } }, [{ $set: { [key]: defaultComponentValue } }]);
    });
  }

  await update('PrivateCloudProject');
  await update('PrivateCloudRequestedProject');
};

export const down = async (db, client) => {};
