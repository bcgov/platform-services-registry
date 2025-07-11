import _startCase from 'lodash-es/startCase';
import _toLower from 'lodash-es/toLower';

const knownRoles: Record<string, string> = {
  projectOwner: 'Project Owner',
  primaryTechnicalLead: 'Primary Technical Lead',
  secondaryTechnicalLead: 'Secondary Technical Lead',
  expenseAuthority: 'Expense Authority',
  editor: 'Editor',
  viewer: 'Viewer',
  subscriber: 'Subscriber',
  billingViewer: 'Billing Viewer',
};

export function formatRole(role: string) {
  const normalized = role.replace(/[^a-zA-Z]/g, '').toLowerCase();
  const matched = Object.entries(knownRoles).find(([key]) => key.toLowerCase() === normalized);
  return matched ? matched[1] : _startCase(_toLower(role));
}

export function getRoleChangeMessage(prevRoles: string[], newRoles: string[]) {
  const hasNew = newRoles.length > 0;
  const hasPrev = prevRoles.length > 0;

  if (!hasNew && !hasPrev) {
    return 'has been updated as a member with roles [] from previous roles []';
  }

  if (hasNew && !hasPrev) {
    return `has been assigned to ${newRoles.join(', ')}`;
  }

  if (!hasNew && hasPrev) {
    return `has been unassigned from ${prevRoles.join(', ')}`;
  }

  return `has been added as a member with roles: ${newRoles.join(', ')} from previous roles: ${prevRoles.join(', ')}`;
}
