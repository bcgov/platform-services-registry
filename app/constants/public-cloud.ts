import { Session } from 'next-auth';
import { Provider, PublicCloudProductMemberRole, Prisma } from '@/prisma/client';
import { productSorts } from './common';

export const providers = Object.values(Provider);
export const publicCloudProductMemberRoles = Object.values(PublicCloudProductMemberRole);

const providerLabels = {
  [Provider.AWS]: 'AWS',
  [Provider.AWS_LZA]: 'AWS LZA',
  [Provider.AZURE]: 'MS Azure',
};

export const providerOptions = providers.map((value) => ({
  label: providerLabels[value] ?? value,
  value,
}));

export function getAllowedOptions(isCreate = false) {
  return providerOptions.filter((opt) => {
    if (opt.value === Provider.AWS) return !isCreate;
    return true;
  });
}

export const reasonForSelectingCloudProviderOptions = [
  { value: 'Cost Efficiency', label: 'Cost efficiency' },
  { value: 'Scalability Needs', label: 'Scalability needs' },
  { value: 'Security Level', label: 'Security level' },
  { value: 'High Availability/Disaster Recovery Features', label: 'High availability/disaster recovery features' },
  {
    value: 'Specialized Cloud Services (e.g., AI/ML, Big Data)',
    label: 'Specialized cloud services (e.g., AI/ML, Big data)',
  },
  { value: 'Vendor Preference', label: 'Vendor preference' },
  { value: 'My Team Expertise', label: 'My team expertise' },
  { value: 'Internal Support Level Within OCIO', label: 'Internal support level within OCIO' },
  { value: 'Project-Specific Requirements', label: 'Project-specific requirements' },
  { value: 'Other', label: 'Other' },
];

export const publicCloudProductSorts = productSorts.concat([
  {
    label: 'Provider (A-Z)',
    sortKey: 'provider',
    sortOrder: Prisma.SortOrder.asc,
  },
  {
    label: 'Provider (Z-A)',
    sortKey: 'provider',
    sortOrder: Prisma.SortOrder.desc,
  },
]);

export const defaultAccountCoding = {
  cc: '000',
  rc: '00000',
  sl: '00000',
  stob: '0000',
  pc: '0000000',
};
