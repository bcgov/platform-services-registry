import AccountCodingBase from '@/components/shared/AccountCoding';

export default function AccountCoding({ disabled, isSubmitting }: { disabled?: boolean; isSubmitting?: boolean }) {
  return (
    <AccountCodingBase disabled={disabled} submittable isSubmitting={isSubmitting}>
      <p className="text-base leading-6">
        Please refer to the Memorandum of Understanding (MoU) signed for this project to enter the information required
        below. Please make sure that the information entered below matches the account coding on the MoU for this
        project.{' '}
        <b>
          If the account coding is changed at any point, all charges in the current quarter will be applied to the new
          account coding.
        </b>{' '}
        The Account Coding can only contain digits and upper case letters.
      </p>
    </AccountCodingBase>
  );
}
