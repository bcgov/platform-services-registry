import { Link, Text } from '@react-email/components';

export default function Header() {
  return (
    <div>
      <Text>
        If you have any questions, send us a message at{' '}
        <Link className="mt-0 h-4" href={`mailto:PlatformServicesTeam@gov.bc.ca`}>
          PlatformServicesTeam@gov.bc.ca
        </Link>
        . We&apos;d love to hear from you.
      </Text>
      <Text>-- The Registry Team</Text>
    </div>
  );
}
