'use client';

import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useSnapshot } from 'valtio';
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
  user: string;
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
  licencePlate: z.string(),
});

const privateCloudProductComments = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export default privateCloudProductComments(({ pathParams, queryParams, session }) => {
  const snap = useSnapshot(privateProductState);
  const { licencePlate } = pathParams;

  const userId = session?.userId;

  // Query for comments
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

  const handleCommentAdded = () => {
    refetchComments(); // Refresh the comments after adding a new one
  };

  return (
    <div>
      <CommentForm
        licencePlate={licencePlate}
        projectId={snap.currentProduct?.id ?? ''}
        userId={userId ?? ''}
        onCommentAdded={handleCommentAdded}
      />
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
              licencePlate={licencePlate}
              onDelete={refetchComments}
              email={comment.user.email}
              image={comment.user.image}
            />
          ))}
        </ul>
      ) : (
        <p>No comments found.</p>
      )}
    </div>
  );
});
