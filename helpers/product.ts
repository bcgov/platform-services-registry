import { ministryOptions } from '@/constants';

export function ministryKeyToName(key: string) {
  return ministryOptions.find((item) => item.value === key)?.label ?? '';
}

interface Member {
  email: string;
}
interface ProductWithMembers {
  projectOwner: Member;
  primaryTechnicalLead: Member;
  secondaryTechnicalLead: Member | null;
}

export function hasContactsChanged(product1?: ProductWithMembers | null, product2?: ProductWithMembers | null) {
  if (!product1 || !product2) return false;

  return (
    product1.projectOwner.email.toLowerCase() !== product2.projectOwner.email.toLowerCase() ||
    product1.primaryTechnicalLead.email.toLowerCase() !== product2.primaryTechnicalLead.email.toLowerCase() ||
    product1.secondaryTechnicalLead?.email.toLowerCase() !== product2.secondaryTechnicalLead?.email.toLowerCase()
  );
}
