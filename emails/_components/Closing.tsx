import { Link, Text } from '@react-email/components';

interface HeaderProps {
  email?: string;
}

export default function Header({ email = 'PlatformServicesTeam@gov.bc.ca' }: HeaderProps) {
  return (
    <div>
      <Text>
        If you have any questions, send us a message at{' '}
        <Link className="mt-0 h-4" href={`mailto:${email}`}>
          {email}
        </Link>
        . We&apos;d love to hear from you.
      </Text>
      <Text>-- The Registry Team</Text>
    </div>
  );
}
