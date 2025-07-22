const ministries = [
  {
    value: 'AEST',
    label: 'Post-Secondary Education and Future Skills Contacts',
  },
  {
    value: 'AG',
    label: 'Attorney General',
  },
  {
    value: 'AGRI',
    label: 'Agriculture and Food',
  },
  {
    value: 'ALC',
    label: 'Advisory Committee Revitalization',
  },
  {
    value: 'BCPC',
    label: 'British Columbia Provincial Committee',
  },
  {
    value: 'CITZ',
    label: 'Citizens Services',
  },
  {
    value: 'DBC',
    label: 'Drug Benefit Council',
  },
  {
    value: 'EAO',
    label: 'Environmental Assessment Office',
  },
  {
    value: 'EDUC',
    label: 'Education and Child Care',
  },
  {
    value: 'EMCR',
    label: 'Emergency Management and Climate Readiness',
  },
  {
    value: 'EMPR',
    label: 'Energy, Mines and Low Carbon Innovation',
  },
  {
    value: 'ENV',
    label: 'Environment and Climate Change Strategy',
  },
  {
    value: 'FIN',
    label: 'Finance',
  },
  {
    value: 'FLNR',
    label: 'Forests, Lands, Natural Resource',
  },
  {
    value: 'HLTH',
    label: 'Health',
  },
  {
    value: 'IRR',
    label: 'Indigenous Relations & Reconciliation',
  },
  {
    value: 'JEDC',
    label: 'Jobs, Economic Development and Innovation',
  },
  {
    value: 'LBR',
    label: 'Labour',
  },
  {
    value: 'LDB',
    label: 'Liquor Distribution Branch',
  },
  {
    value: 'MCF',
    label: 'Children and Family Development',
  },
  {
    value: 'MMHA',
    label: 'Mental Health and Addictions',
  },
  {
    value: 'PSA',
    label: 'Public Service Agency',
  },
  {
    value: 'PSSG',
    label: 'Public Safety and Solicitor General',
  },
  {
    value: 'SDPR',
    label: 'Social Development and Poverty Reduction',
  },
  {
    value: 'TCA',
    label: 'Tangible Capital Assets',
  },
  {
    value: 'TRAN',
    label: 'Transportation and Infrastructure',
  },
  {
    value: 'HMA',
    label: 'Housing and Municipal Affairs',
  },
  {
    value: 'WLRS',
    label: 'Water, Land and Resource Stewardship',
  },
];

export const up = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const collection = db.collection('Organization');
    const existing = await collection
      .find({ code: { $in: ministries.map((m) => m.value) } })
      .project({ code: 1 })
      .toArray();

    const existingCodes = new Set(existing.map((doc) => doc.code));

    const newEntries = ministries
      .filter((m) => !existingCodes.has(m.value))
      .map((m) => ({
        code: m.value,
        name: m.label,
      }));

    if (newEntries.length > 0) {
      const result = await collection.insertMany(newEntries);
      console.log('migrate_ministries: inserted', result.insertedCount);
    } else {
      console.log('migrate_ministries: no new ministries to insert');
    }
  });

  session.endSession();
};

export const down = async (db, client) => {};
