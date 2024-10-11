'use client';

import { Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { z } from 'zod';
import CommentBubble from '@/components/comments/CommentBubble';
import CommentForm from '@/components/comments/CommentForm';
import EmptySearch from '@/components/table/EmptySearch';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { getAllPrivateCloudComments } from '@/services/backend/private-cloud/products';
import { usePrivateProductState } from '@/states/global';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  image: string;
}

interface Comment {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  text: string;
  userId: string;
  user: User;
}

const pathParamSchema = z.object({
  id: z.string(),
});

const privateCloudRequestComments = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});

export default privateCloudRequestComments(({ pathParams, session }) => {
  const [, privateSnap] = usePrivateProductState();
  const { id: requestId } = pathParams;
  const userId = session?.userId;

  // Query for comments
  const {
    data: comments,
    isLoading: commentsLoading,
    isError: commentsIsError,
    error: commentsError,
    refetch: refetchComments,
  } = useQuery({
    queryKey: ['comments', privateSnap.licencePlate, requestId],
    queryFn: () => getAllPrivateCloudComments(privateSnap.licencePlate, requestId),
    enabled: !!privateSnap.licencePlate && !!requestId,
  });

  const handleCommentAdded = () => {
    refetchComments(); // Refresh the comments after adding a new one
  };

  return (
    <div>
      <Alert variant="light" color="blue" title="" icon={<IconInfoCircle />} mb={20}>
        This page is for admin only; users do not have access.
      </Alert>
      <CommentForm
        licencePlate={privateSnap.licencePlate}
        requestId={requestId}
        userId={userId ?? ''}
        onCommentAdded={handleCommentAdded}
        addButtonText="Add Comment"
        postButtonText="Post Comment"
        placeholderText="Leave a comment..."
      />
      {commentsLoading && <p>Loading comments...</p>}
      {commentsIsError && <p>Error loading comments: {commentsError.message}</p>}
      {comments?.length > 0 ? (
        <ul>
          {comments.map((comment: Comment) => (
            <CommentBubble
              key={comment.id}
              text={comment.text}
              timeStamp={new Date(comment.createdAt)}
              updatedAt={new Date(comment.updatedAt)}
              firstName={comment.user.firstName}
              lastName={comment.user.lastName}
              isAuthor={userId === comment.userId}
              commentId={comment.id}
              licencePlate={privateSnap.licencePlate}
              refetchComments={refetchComments}
              email={comment.user.email}
              image={comment.user.image}
            />
          ))}
        </ul>
      ) : (
        !commentsLoading && <EmptySearch cloud="private-cloud" type="comments" />
      )}
    </div>
  );
});
