import { Heading, Link, Text } from '@react-email/components';

interface Props {
  currentEmails: string[];
  requestedEmails: string[];
}

export default function NotificationEmailChanges({ currentEmails, requestedEmails }: Props) {
  const normalize = (email: string) => email.trim().toLowerCase();

  const current = new Set(currentEmails.map(normalize));
  const requested = new Set(requestedEmails.map(normalize));

  const addedEmails = [...requested].filter((email) => !current.has(email));
  const removedEmails = [...current].filter((email) => !requested.has(email));

  if (!addedEmails.length && !removedEmails.length) {
    return null;
  }

  return (
    <div>
      <Heading className="text-lg text-black">Notification Email Changes</Heading>

      {addedEmails.length > 0 && (
        <div className="mb-4">
          <Text className="font-semibold mb-2">Added Notification Emails</Text>

          {addedEmails.map((email) => (
            <Text key={email} className="mb-1">
              <Link href={`mailto:${email}`}>{email}</Link>
            </Text>
          ))}
        </div>
      )}

      {removedEmails.length > 0 && (
        <div className="mb-4">
          <Text className="font-semibold mb-2">Removed Notification Emails</Text>

          {removedEmails.map((email) => (
            <Text key={email} className="mb-1">
              <Link href={`mailto:${email}`}>{email}</Link>
            </Text>
          ))}
        </div>
      )}
    </div>
  );
}
