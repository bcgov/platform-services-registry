'use client';

import { useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { z } from 'zod';
import CommentBubble from '@/components/comments/CommentBubble';
import CommentForm from '@/components/comments/CommentForm';
import createClientPage from '@/core/client-page';
import { getAllPrivateCloudComments } from '@/services/backend/private-cloud/products';
import { privateProductState } from '@/states/global';

interface User {
  firstName: string;
  lastName: string;
  email: string;
}

interface Comment {
  id: string;
  created: Date;
  updatedAt: Date;
  text: string;
  userId: string;
  user: User;
}

const pathParamSchema = z.object({
  id: z.string(),
});

const privateCloudRequestComments = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});

export default privateCloudRequestComments(({ pathParams, session }) => {
  const { id: requestId } = pathParams;
  const { licencePlate } = privateProductState;

  const userId = session?.userId;

  useEffect(() => {
    console.log('Child Page Path Params:', pathParams);
    console.log('Licence Plate:', licencePlate);
  }, [pathParams, licencePlate]);

  // Query for comments
  const {
    data: comments,
    isLoading: commentsLoading,
    isError: commentsIsError,
    error: commentsError,
    refetch: refetchComments,
  } = useQuery({
    queryKey: ['comments', requestId],
    queryFn: () => getAllPrivateCloudComments(licencePlate, requestId),
    enabled: !!requestId,
  });

  const handleCommentAdded = () => {
    refetchComments(); // Refresh the comments after adding a new one
  };

  return (
    <div>
      <CommentForm
        licencePlate={licencePlate}
        requestId={requestId}
        userId={userId ?? ''}
        onCommentAdded={handleCommentAdded}
      />
      {commentsLoading && <p>Loading comments...</p>}
      {commentsIsError && <p>Error loading comments: {commentsError.message}</p>}
      {comments?.length > 0 ? (
        <ul>
          {comments.map((comment: Comment) => (
            <CommentBubble
              key={comment.id}
              text={comment.text}
              timeStamp={new Date(comment.created)}
              updatedAt={new Date(comment.updatedAt)}
              firstName={comment.user.firstName}
              lastName={comment.user.lastName}
              isAuthor={userId === comment.userId}
              commentId={comment.id}
              licencePlate={licencePlate}
              onDelete={refetchComments}
            />
          ))}
        </ul>
      ) : (
        !commentsLoading && <p>No comments found.</p>
      )}
    </div>
  );
});
