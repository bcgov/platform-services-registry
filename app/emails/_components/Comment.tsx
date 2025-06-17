import { Text, Heading, Hr } from '@react-email/components';

interface CommentProps {
  readonly requestComment?: string | null;
  readonly decisionComment?: string | null;
  readonly isCancellation?: boolean;
}

export default function Comment({ requestComment, decisionComment, isCancellation }: CommentProps) {
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
          <Text className="font-semibold">{isCancellation ? 'Cancellation' : 'Admin'} Comment:</Text>
          <Text>{decisionComment}</Text>
        </div>
      )}
    </div>
  );
}
