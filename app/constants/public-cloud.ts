import { Provider } from '@prisma/client';

export const providers = Object.values(Provider);

export const providerOptions = providers.map((v) => ({
  label: v === Provider.AZURE ? 'MS Azure' : v,
  value: v,
}));

export const reasonForSelectingCloudProviderOptions = [
  { value: 'Cost Efficiency', label: 'Cost Efficiency' },
  { value: 'Scalability Needs', label: 'Scalability Needs' },
  { value: 'Security Level', label: 'Security Level' },
  { value: 'High Availability/Disaster Recovery Features', label: 'High Availability/Disaster Recovery Features' },
  {
    value: 'Specialized Cloud Services (e.g., AI/ML, Big Data)',
    label: 'Specialized Cloud Services (e.g., AI/ML, Big Data)',
  },
  { value: 'Vendor Preference', label: 'Vendor Preference' },
  { value: 'My Team Expertise', label: 'My Team Expertise' },
  { value: 'Internal Support Level Within OCIO', label: 'Internal Support Level within OCIO' },
  { value: 'Project-Specific Requirements', label: 'Project-Specific Requirements' },
  { value: 'Other', label: 'Other' },
];
