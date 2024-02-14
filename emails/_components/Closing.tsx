import { Link, Text } from '@react-email/components';

interface HeaderProps {
  email?: string;
  team?: string;
}

export default function Footer({
  email = 'PlatformServicesTeam@gov.bc.ca',
  team = 'Platform Services Team',
}: HeaderProps) {
  return (
    <div>
      <Text>
        If you have any questions, send us a message at{' '}
        <Link className="mt-0 h-4" href={`mailto:${email}`}>
          {email}
        </Link>
        . We&apos;d love to hear from you.
      </Text>
      <Text>{team}</Text>
    </div>
  );
}
