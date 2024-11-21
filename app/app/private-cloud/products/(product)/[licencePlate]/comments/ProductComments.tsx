'use client';

import { LoadingOverlay, Box } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import CommentBubble from '@/components/comments/CommentBubble';
import CommentForm from '@/components/comments/CommentForm';
import EmptySearch from '@/components/table/EmptySearch';
import { getAllPrivateCloudComments } from '@/services/backend/private-cloud/products';
import { PrivateCloudComment } from '@/types/private-cloud';

export default function ProductComments({
  licencePlate,
  productId,
  userId,
}: {
  licencePlate: string;
  productId: string;
  userId: string;
}) {
  const {
    data: comments,
    isLoading: commentsLoading,
    isError: commentsIsError,
    error: commentsError,
    refetch: refetchComments,
  } = useQuery({
    queryKey: ['comments', licencePlate],
    queryFn: () => getAllPrivateCloudComments(licencePlate),
    enabled: !!licencePlate,
  });

  return (
    <>
      <Box pos="relative">
        <LoadingOverlay visible={commentsLoading || !comments} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
        <CommentForm
          licencePlate={licencePlate}
          projectId={productId}
          userId={userId}
          onCommentAdded={refetchComments}
        />
        {comments?.length > 0 ? (
          comments.map((comment: PrivateCloudComment) => (
            <CommentBubble
              key={comment.id}
              text={comment.text}
              timeStamp={new Date(comment.createdAt)}
              updatedAt={new Date(comment.updatedAt)}
              firstName={comment.user.firstName ?? ''}
              lastName={comment.user.lastName ?? ''}
              isAuthor={userId === comment.userId}
              commentId={comment.id}
              licencePlate={licencePlate}
              refetchComments={refetchComments}
              email={comment.user.email}
              image={comment.user.image ?? ''}
            />
          ))
        ) : (
          <EmptySearch cloud="private-cloud" type="notes" />
        )}
      </Box>
    </>
  );
}
