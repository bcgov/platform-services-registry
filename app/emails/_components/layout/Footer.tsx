import { Link, Text } from '@react-email/components';
import { privateCloudTeamEmail } from '@/constants';

interface HeaderProps {
  email?: string;
  team?: string;
}

export default function Footer({ email = privateCloudTeamEmail, team = 'Platform Services Team' }: HeaderProps) {
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
