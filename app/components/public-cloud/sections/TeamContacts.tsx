import React from 'react';
import SupportContact from '@/components/form/SupportContact';
import TeamContactsBase from '@/components/form/TeamContacts';

interface Props {
  disabled?: boolean;
}

const userAttributes = [
  {
    role: 'Project Owner (PO)',
    content:
      'This is the business owner of the application, and their contact information will be used for non-technical inquiries.',
    key: 'projectOwner',
    isOptional: false,
  },
  {
    role: 'Primary Technical Lead (TL)',
    content:
      'This is the DevOps specialist that handles technical queries and platform updates. A Primary Technical Lead is required.',
    key: 'primaryTechnicalLead',
    isOptional: false,
  },
  {
    role: 'Secondary Technical Lead (TL)',
    content:
      'This is typically the DevOps specialist. We use this information to contact them with technical questions or notify them about platform events. You require a Primary Technical Lead, a Secondary Technical Lead is optional.',
    key: 'secondaryTechnicalLead',
    isOptional: true,
  },
  {
    role: 'Expense Authority (EA)',
    content:
      'This is typically refers to the permission granted to an individual to incur expenses on behalf of the organization within specified limits and guidelines.',
    key: 'expenseAuthority',
    isOptional: false,
  },
];

export default function TeamContacts({ disabled }: Props) {
  return (
    <>
      <TeamContactsBase disabled={disabled} userAttributes={userAttributes} />
    </>
  );
}
