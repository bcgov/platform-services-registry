import { Text } from '@react-email/components';

interface CommentProps {
  requestComment?: string | null;
  decisionComment?: string | null;
}

export default function Comment({ requestComment, decisionComment }: CommentProps) {
  return (
    <div>
      {requestComment && (
        <div>
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
