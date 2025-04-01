import React from 'react';
import TeamContactsBase from '@/components/shared/TeamContacts';

interface Props {
  disabled?: boolean;
}

const userAttributes = [
  {
    role: 'Project Owner (PO)',
    content:
      'This is the business owner of the application. They are the primary point of contact for non-technical inquiries, and their contact information will be used for such purposes.',
    key: 'projectOwner',
    isOptional: false,
    blackListMessage: 'Project Owner and Primary Technical Lead must be different users.',
    blackListIds: ['primaryTechnicalLeadId'],
  },
  {
    role: 'Primary Technical Lead (TL)',
    content:
      'This is the DevOps specialist who is responsible for handling technical queries and managing platform updates. This role is mandatory, and they serve as the main point of contact for all technical matters.',
    key: 'primaryTechnicalLead',
    isOptional: false,
    blackListMessage: 'Project Owner and Primary Technical Lead must be different users.',
    blackListIds: ['projectOwnerId'],
  },
  {
    role: 'Secondary Technical Lead (TL)',
    content:
      'This is an optional role, typically filled by another DevOps specialist. They may be contacted for technical questions or notified about platform events as a backup to the Primary Technical Lead.',
    key: 'secondaryTechnicalLead',
    isOptional: true,
    requiresUniqueUser: false,
  },
  {
    role: 'Expense Authority (EA)',
    content:
      'This is typically refers to the permission granted to an individual to incur expenses on behalf of the organization within specified limits and guidelines.',
    key: 'expenseAuthority',
    isOptional: false,
    requiresUniqueUser: false,
  },
];

export default function TeamContacts({ disabled }: Props) {
  return (
    <>
      <TeamContactsBase disabled={disabled} userAttributes={userAttributes} />
    </>
  );
}
