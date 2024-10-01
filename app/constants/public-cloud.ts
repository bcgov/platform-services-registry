import { Provider } from '@prisma/client';
import { Session } from 'next-auth';

export const providers = Object.values(Provider);

const providerLabels = {
  [Provider.AWS]: 'AWS',
  [Provider.AWS_LZA]: 'AWS LZA',
  [Provider.AZURE]: 'MS Azure',
};

export const providerOptions = providers.map((value) => ({
  label: providerLabels[value] ?? value,
  value,
}));

export function getAllowedOptions(session: Session) {
  return providerOptions.filter((opt) => {
    if (opt.value === Provider.AWS_LZA) return session?.previews.awsLza;
    if (opt.value === Provider.AZURE) return session?.previews.azure;
    return true;
  });
}

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
