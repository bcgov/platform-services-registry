import { Link, Tailwind, Text } from '@react-email/components';
import { TailwindConfig } from './TailwindConfig';

export default function Header() {
  return (
    <Tailwind config={TailwindConfig}>
      <div>
        <Text>
          If you have any questions, send us a message at{' '}
          <Link className="mt-0 h-4" href={`mailto:PlatformServicesTeam@gov.bc.ca`}>
            PlatformServicesTeam@gov.bc.ca
          </Link>
          . We'd love to hear from you.
        </Text>
        <Text>-- The Registry Team</Text>
      </div>
    </Tailwind>
  );
}
