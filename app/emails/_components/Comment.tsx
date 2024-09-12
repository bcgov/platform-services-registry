import { Text, Heading, Hr } from '@react-email/components';

interface CommentProps {
  requestComment?: string | null;
  decisionComment?: string | null;
}

export default function Comment({ requestComment, decisionComment }: CommentProps) {
  if (!requestComment && !decisionComment) return null;

  return (
    <div>
      <Hr className="my-4" />

      <Heading className="text-lg text-black">Comments</Heading>
      {requestComment && (
        <div>
          <Text className="font-semibold">User Comment:</Text>
          <Text>{requestComment}</Text>
        </div>
      )}
      {decisionComment && (
        <div>
          <Text className="font-semibold">Admin Comment:</Text>
          <Text>{decisionComment}</Text>
        </div>
      )}
    </div>
  );
}
