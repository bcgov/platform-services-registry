export const adminEmails = `${process.env.PRIVATE_ADMIN_EMAILS}`.split(',');
export const adminPublicEmails = `${process.env.PUBLIC_ADMIN_EMAILS}`.split(',');

export const ministriesNames = [
  {
    id: 1,
    name: 'AEST',
    humanFriendlyName: 'Post-Secondary Education and Future Skills Contacts',
  },
  {
    id: 2,
    name: 'AG',
    humanFriendlyName: 'Attorney General',
  },
  {
    id: 3,
    name: 'AGRI',
    humanFriendlyName: 'Agriculture and Food',
  },
  {
    id: 4,
    name: 'ALC',
    humanFriendlyName: 'Advisory Committee Revitalization',
  },
  {
    id: 5,
    name: 'BCPC',
    humanFriendlyName: 'British Columbia Provincial Committee',
  },
  {
    id: 5,
    name: 'BCPC',
    humanFriendlyName: 'British Columbia Provincial Committee',
  },
  {
    id: 6,
    name: 'CITZ',
    humanFriendlyName: "Citizens' Services",
  },
  {
    id: 7,
    name: 'DBC',
    humanFriendlyName: 'Drug Benefit Council',
  },
  {
    id: 8,
    name: 'EAO',
    humanFriendlyName: 'Environmental Assessment Office',
  },
  {
    id: 9,
    name: 'EDUC',
    humanFriendlyName: 'Education and Child Care',
  },
  {
    id: 10,
    name: 'EMBC',
    humanFriendlyName: 'Emergency management',
  },
  {
    id: 11,
    name: 'EMPR',
    humanFriendlyName: 'Energy, Mines and Low Carbon Innovation',
  },
  {
    id: 12,
    name: 'ENV',
    humanFriendlyName: 'Environment and Climate Change Strategy',
  },
  {
    id: 13,
    name: 'FIN',
    humanFriendlyName: 'Finance',
  },
  {
    id: 14,
    name: 'FIN',
    humanFriendlyName: 'Finance',
  },
  {
    id: 15,
    name: 'FLNR',
    humanFriendlyName: 'Forests, Lands, Natural Resource',
  },
  {
    id: 16,
    name: 'HLTH',
    humanFriendlyName: 'Health',
  },
  {
    id: 17,
    name: 'IRR',
    humanFriendlyName: 'Indigenous Relations & Reconciliation',
  },
  {
    id: 18,
    name: 'JEDC',
    humanFriendlyName: 'Jobs, Economic Development and Innovation',
  },
  {
    id: 19,
    name: 'LBR',
    humanFriendlyName: 'Labour',
  },
  {
    id: 20,
    name: 'LDB',
    humanFriendlyName: 'Liquor Distribution Branch',
  },
  {
    id: 21,
    name: 'MAH',
    humanFriendlyName: 'Municipal Affairs and Housing',
  },
  {
    id: 22,
    name: 'MCF',
    humanFriendlyName: 'Children and Family Development',
  },
  {
    id: 23,
    name: 'MMHA',
    humanFriendlyName: 'Mental Health and Addictions',
  },
  {
    id: 24,
    name: 'PSA',
    humanFriendlyName: 'Public Service Agency',
  },
  {
    id: 25,
    name: 'PSSG',
    humanFriendlyName: 'Public Safety and Solicitor General',
  },
  {
    id: 26,
    name: 'SDPR',
    humanFriendlyName: 'Social Development and Poverty Reduction',
  },
  {
    id: 28,
    name: 'TCA',
    humanFriendlyName: 'Tangible Capital Assets',
  },
  {
    id: 29,
    name: 'TRAN',
    humanFriendlyName: 'Transportation and Infrastructure',
  },
  {
    id: 30,
    name: 'HOUS',
    humanFriendlyName: 'Housing',
  },
];

// const ministriesNamesUpdated = [
//   {
//     id: 1,
//     name: "AF",
//     humanFriendlyName: "Agriculture and Food"
//   },
//   {
//     id: 2,
//     name: "AG",
//     humanFriendlyName: "Attorney General"
//   },
//   {
//     id: 3,
//     name: "MSFD",
//     humanFriendlyName: "Children and Family Development"
//   },
//   {
//     id: 4,
//     name: "CITZ",
//     humanFriendlyName: "Citizens' Services"
//   },
//   {
//     id: 5,
//     name: "ECC",
//     humanFriendlyName: "Education and Child Care"
//   },
//   {
//     id: 6,
//     name: "EMCR",
//     humanFriendlyName: "Emergency Management and Climate Readiness"
//   },
//   {
//     id: 7,
//     name: "EMLI",
//     humanFriendlyName: "Energy, Mines and Low Carbon Innovation"
//   },
//   {
//     id: 8,
//     name: "ENV",
//     humanFriendlyName: "Environment and Climate Change Strategy"
//   },
//   {
//     id: 9,
//     name: "FIN",
//     humanFriendlyName: "Finance"
//   },
//   {
//     id: 10,
//     name: "FOR",
//     humanFriendlyName: "Forests"
//   },
//   {
//     id: 11,
//     name: "HLTH",
//     humanFriendlyName: "Health"
//   },
//  {
//     id: 12,
//     name: "HOUS",
//     humanFriendlyName: "Housing"
//   },
//   {
//     id: 13,
//     name: "IRR",
//     humanFriendlyName: "Indigenous Relations & Reconciliation"
//   },
//   {
//     id: 14,
//     name: "JEDI",
//     humanFriendlyName: "Jobs, Economic Development and Innovation"
//   },
//   {
//     id: 15,
//     name: "LBR",
//     humanFriendlyName: "Labour"
//   },
//   {
//     id: 16,
//     name: "MMHA",
//     humanFriendlyName: "Mental Health and Addictions"
//   },
//   {
//     id: 17,
//     name: "MUNI",
//     humanFriendlyName: "Municipal Affairs"
//   },
//   {
//     id: 18,
//     name: "PSFS",
//     humanFriendlyName: "Post-Secondary Education and Future Skills"
//   },
//   {
//     id: 19,
//     name: "PSSG",
//     humanFriendlyName: "Public Safety and Solicitor General"
//   },
//   {
//     id: 20,
//     name: "SDPR",
//     humanFriendlyName: "Social Development and Poverty Reduction"
//   },
//   {
//     id: 21,
//     name: "TACS",
//     humanFriendlyName: "Tourism, Arts, Culture and Sport"
//   },
//   {
//     id: 22,
//     name: "MOTI",
//     humanFriendlyName: "Transportation and Infrastructure"
//   },
//   {
//     id: 23,
//     name: "WLRS",
//     humanFriendlyName: "Water, Land and Resource Stewardship"
//   },
// ];

export const clusterNames = [
  {
    id: 1,
    name: 'clab',
    humanFriendlyName: 'CLAB Calgary',
  },
  {
    id: 2,
    name: 'klab',
    humanFriendlyName: 'KLAB Kamloops',
  },
  {
    id: 3,
    name: 'silver',
    humanFriendlyName: 'Silver Kamloops',
  },
  {
    id: 4,
    name: 'gold',
    humanFriendlyName: 'Gold Kamloops',
  },
  {
    id: 5,
    name: 'golddr',
    humanFriendlyName: 'Gold (DR) Calgary',
  },
  {
    id: 6,
    name: 'klab2',
    humanFriendlyName: 'KLAB2 Kamloops',
  },
  {
    id: 7,
    name: 'emerald',
    humanFriendlyName: 'Emerald Hosting Tier',
  },
];
