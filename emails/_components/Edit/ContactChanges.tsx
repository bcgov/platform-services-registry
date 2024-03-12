import { Heading, Link, Text } from '@react-email/components';
import { User } from '@prisma/client';

export default function ContactChanges({
  poCurrent,
  tl1Current,
  tl2Current,
  expenseAuthorityCurrent,
  poRequested,
  tl1Requested,
  tl2Requested,
  expenseAuthorityRequested,
  requestedLabel = 'Requested',
}: {
  poCurrent: User;
  tl1Current: User;
  tl2Current: User | null;
  expenseAuthorityCurrent?: User | null;
  poRequested: User;
  tl1Requested: User;
  tl2Requested: User | null;
  expenseAuthorityRequested?: User;
  requestedLabel?: string;
}) {
  return (
    <div>
      <Heading className="text-lg text-black">Contact Changes</Heading>
      {poCurrent.id !== poRequested.id && (
        <div className="mb-4">
          <Text className="font-semibold mb-0 ">Current Product Owner</Text>
          <Text className="mb-1 mt-2">
            {poCurrent.firstName} {poCurrent.lastName}
          </Text>
          <Link className="mb-2" href={`mailto:${poCurrent.email}`}>
            {poCurrent.email}
          </Link>
          <Text className="font-semibold mb-0">{requestedLabel} Product Owner</Text>
          <Text className="mb-1 mt-2">
            {poRequested.firstName} {poRequested.lastName}
          </Text>
          <Link href={`mailto:${poRequested.email}`}>{poRequested.email}</Link>
        </div>
      )}
      {tl1Current.id !== tl1Requested.id && (
        <div className="mb-4 mt-10">
          <Text className="font-semibold mb-0 ">Current Primary Technical Lead</Text>
          <Text className="mb-1 mt-2">
            {tl1Current.firstName} {tl1Current.lastName}
          </Text>
          <Link className="mb-2" href={`mailto:${tl1Current.email}`}>
            {tl1Current.email}
          </Link>
          <Text className="font-semibold mb-0">{requestedLabel} Primary Technical Lead</Text>
          <Text className="mb-1 mt-2">
            {tl1Requested.firstName} {tl1Requested.lastName}
          </Text>
          <Link href={`mailto:${tl1Requested.email}`}>{tl1Requested.email}</Link>
        </div>
      )}
      {tl2Current?.id !== tl2Requested?.id && (
        <div className="mb-4 mt-10">
          <Text className="font-semibold mb-0">Current Secondary Technical Lead</Text>
          {tl2Current ? (
            <>
              <Text className="mb-1 mt-2">
                {' '}
                {tl2Current.firstName} {tl2Current.lastName}
              </Text>
              <Link className="mb-2" href={`mailto:${tl2Current.email}`}>
                {tl2Current.email}
              </Link>
            </>
          ) : (
            <Text className="mb-1">No Current Lead</Text>
          )}
          <Text className="font-semibold mb-0">{requestedLabel} Secondary Technical Lead</Text>
          {tl2Requested ? (
            <>
              <Text className="mb-1 mt-2">
                {' '}
                {tl2Requested.firstName} {tl2Requested.lastName}
              </Text>
              <Link href={`mailto:${tl2Requested.email}`}>{tl2Requested.email}</Link>
            </>
          ) : (
            <Text>No Requested Lead</Text>
          )}
        </div>
      )}
      {expenseAuthorityCurrent?.id !== expenseAuthorityRequested?.id && (
        <div className="mb-4 mt-10">
          <Text className="font-semibold mb-0">Current Expense Authority</Text>
          {expenseAuthorityCurrent ? (
            <>
              <Text className="mb-1 mt-2">
                {expenseAuthorityCurrent.firstName} {expenseAuthorityCurrent.lastName}
              </Text>
              <Link className="mb-2" href={`mailto:${expenseAuthorityCurrent.email}`}>
                {expenseAuthorityCurrent.email}
              </Link>
            </>
          ) : (
            <Text className="mb-1">No Current Expense Authority</Text>
          )}
          <Text className="font-semibold mb-0">{requestedLabel}Expense Authority</Text>
          <Text className="mb-1 mt-2">
            {expenseAuthorityRequested?.firstName} {expenseAuthorityRequested?.lastName}
          </Text>
          <Link href={`mailto:${expenseAuthorityRequested?.email}`}>{expenseAuthorityRequested?.email}</Link>
        </div>
      )}
    </div>
  );
}
