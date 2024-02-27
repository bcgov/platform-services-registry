import { Cluster, Ministry, Provider } from '@prisma/client';

export const clusters = Object.values(Cluster).filter((cluster) => cluster !== 'GOLDDR');

export const ministries = Object.values(Ministry);

export const providers = Object.values(Provider);

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
    id: 6,
    name: 'CITZ',
    humanFriendlyName: 'Citizens Services',
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
    humanFriendlyName: 'Emergency Management',
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
    name: 'FLNR',
    humanFriendlyName: 'Forests, Lands, Natural Resource',
  },
  {
    id: 15,
    name: 'HLTH',
    humanFriendlyName: 'Health',
  },
  {
    id: 16,
    name: 'IRR',
    humanFriendlyName: 'Indigenous Relations & Reconciliation',
  },
  {
    id: 17,
    name: 'JEDC',
    humanFriendlyName: 'Jobs, Economic Development and Innovation',
  },
  {
    id: 18,
    name: 'LBR',
    humanFriendlyName: 'Labour',
  },
  {
    id: 19,
    name: 'LDB',
    humanFriendlyName: 'Liquor Distribution Branch',
  },
  {
    id: 20,
    name: 'MAH',
    humanFriendlyName: 'Municipal Affairs and Housing',
  },
  {
    id: 21,
    name: 'MCF',
    humanFriendlyName: 'Children and Family Development',
  },
  {
    id: 22,
    name: 'MMHA',
    humanFriendlyName: 'Mental Health and Addictions',
  },
  {
    id: 23,
    name: 'PSA',
    humanFriendlyName: 'Public Service Agency',
  },
  {
    id: 24,
    name: 'PSSG',
    humanFriendlyName: 'Public Safety and Solicitor General',
  },
  {
    id: 25,
    name: 'SDPR',
    humanFriendlyName: 'Social Development and Poverty Reduction',
  },
  {
    id: 26,
    name: 'TCA',
    humanFriendlyName: 'Tangible Capital Assets',
  },
  {
    id: 27,
    name: 'TRAN',
    humanFriendlyName: 'Transportation and Infrastructure',
  },
  {
    id: 28,
    name: 'HOUS',
    humanFriendlyName: 'Ministry of Housing',
  },
];

export const AGMinistries = ['AG', 'PSSG', 'EMBC', 'HOUS'];
