import { ministriesNames } from '@/ches/emailConstant';

function checkUserRolesForMinistry(roles: string[]) {
  return roles.some((role) => role.includes('ministry'));
}

export default function checkUserMinistryRole(roles: string[]): string | null {
  if (checkUserRolesForMinistry(roles)) {
    for (let ministry of ministriesNames) {
      for (let role of roles) {
        if (role.toLocaleLowerCase().includes(ministry.name.toLocaleLowerCase())) {
          return ministry.name;
        }
      }
    }
  }
  return null;
}
