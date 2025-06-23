import React from 'react';
import TeamContactsBase from '@/components/shared/TeamContacts';
import AdditionalTeamMembers from './AdditionalTeamMembers';

interface Props {
  isTeamContactsDisabled?: boolean;
  isAdditionalMembersDisabled?: boolean;
  showAdditionalTeamMembers?: boolean;
}

const userAttributes = [
  {
    role: 'Project Owner (PO)',
    content:
      'This is the business owner of the application. They are the primary point of contact for non-technical inquiries, and their contact information will be used for such purposes.',
    key: 'projectOwner',
    isOptional: false,
    blacklistMessage: 'Project Owner and Primary Technical Lead must be different users.',
    blacklistFields: ['primaryTechnicalLeadId'],
  },
  {
    role: 'Primary Technical Lead (TL)',
    content:
      'This is the DevOps specialist who is responsible for handling technical queries and managing platform updates. This role is mandatory, and they serve as the main point of contact for all technical matters.',
    key: 'primaryTechnicalLead',
    isOptional: false,
    blacklistMessage: 'Project Owner and Primary Technical Lead must be different users.',
    blacklistFields: ['projectOwnerId'],
  },
  {
    role: 'Secondary Technical Lead (TL)',
    content:
      'This is an optional role, typically filled by another DevOps specialist. They may be contacted for technical questions or notified about platform events as a backup to the Primary Technical Lead.',
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

export default function TeamContacts({ isTeamContactsDisabled, isAdditionalMembersDisabled = undefined }: Props) {
  return (
    <div className="m-5">
      <h6 className="text-base 2xl:text-xl font-semibold leading-7">Primary Contacts</h6>
      <TeamContactsBase disabled={isTeamContactsDisabled} userAttributes={userAttributes} />
      {isAdditionalMembersDisabled && (
        <>
          <h6 className="text-base 2xl:text-xl font-semibold leading-7">Additional team members (optional)</h6>
          <AdditionalTeamMembers disabled={isAdditionalMembersDisabled} />
        </>
      )}
    </div>
  );
}
