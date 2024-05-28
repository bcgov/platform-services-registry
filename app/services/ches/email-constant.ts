import { PRIVATE_ADMIN_EMAILS, PUBLIC_ADMIN_EMAILS } from '@/config';

export const adminPrivateEmails = `${PRIVATE_ADMIN_EMAILS}`.split(',');
export const adminPublicEmails = `${PUBLIC_ADMIN_EMAILS}`.split(',');

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
