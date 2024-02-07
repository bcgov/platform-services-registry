import { Text } from '@react-email/components';

interface CommentProps {
  userComment?: string | null;
  adminComment?: string | null;
}

export default function Comment({ userComment, adminComment }: CommentProps) {
  return (
    <div>
      {userComment && (
        <div>
          <Text>{userComment}</Text>
        </div>
      )}
      {adminComment && (
        <div>
          <Text className="font-semibold">Admin Comment:</Text>
          <Text>{adminComment}</Text>
        </div>
      )}
    </div>
  );
}
