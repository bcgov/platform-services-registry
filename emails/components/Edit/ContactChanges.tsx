import { Heading, Link, Text } from '@react-email/components';
import { User } from '@prisma/client';

export default function ContactChanges({
  poCurrent,
  tl1Current,
  tl2Current,
  poRequested,
  tl1Requested,
  tl2Requested,
}: {
  poCurrent: User;
  tl1Current: User;
  tl2Current: User | null;
  poRequested: User;
  tl1Requested: User;
  tl2Requested: User | null;
}) {
  return (
    <div>
      <Heading className="text-lg text-black mb-2">Contact Changes</Heading>
      {poCurrent.id !== poRequested.id && (
        <div className="mb-4">
          <Text className="font-semibold mb-0">Current Product Owner</Text>
          <Text className="mb-1">
            {poCurrent.firstName} {poCurrent.lastName}
          </Text>
          <Link className="mb-2" href={`mailto:${poCurrent.email}`}>
            {poCurrent.email}
          </Link>
          <Text className="font-semibold mb-0">Requested Product Owner</Text>
          <Text className="mb-1">
            {poRequested.firstName} {poRequested.lastName}
          </Text>
          <Link href={`mailto:${poRequested.email}`}>{poRequested.email}</Link>
        </div>
      )}
      {tl1Current.id !== tl1Requested.id && (
        <div className="mb-4">
          <Text className="font-semibold mb-0">Current Primary Technical Lead</Text>
          <Text className="mb-1">
            {tl1Current.firstName} {tl1Current.lastName}
          </Text>
          <Link className="mb-2" href={`mailto:${tl1Current.email}`}>
            {tl1Current.email}
          </Link>
          <Text className="font-semibold mb-0">Requested Primary Technical Lead</Text>
          <Text className="mb-1">
            {tl1Requested.firstName} {tl1Requested.lastName}
          </Text>
          <Link href={`mailto:${tl1Requested.email}`}>{tl1Requested.email}</Link>
        </div>
      )}
      {tl2Current?.id !== tl2Requested?.id && (
        <div className="mb-4">
          <Text className="font-semibold mb-0">Current Secondary Technical Lead</Text>
          {tl2Current ? (
            <>
              <Text className="mb-1">
                {tl2Current.firstName} {tl2Current.lastName}
              </Text>
              <Link className="mb-2" href={`mailto:${tl2Current.email}`}>
                {tl2Current.email}
              </Link>
            </>
          ) : (
            <Text className="mb-1">No Current Lead</Text>
          )}
          <Text className="font-semibold mb-0">Requested Secondary Technical Lead</Text>
          {tl2Requested ? (
            <>
              <Text className="mb-1">
                {tl2Requested.firstName} {tl2Requested.lastName}
              </Text>
              <Link href={`mailto:${tl2Requested.email}`}>{tl2Requested.email}</Link>
            </>
          ) : (
            <Text>No Requested Lead</Text>
          )}
        </div>
      )}
    </div>
  );
}
