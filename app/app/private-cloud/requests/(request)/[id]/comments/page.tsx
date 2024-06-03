'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { z } from 'zod';
import CommentBubble from '@/components/comments/CommentBubble';
import CommentForm from '@/components/comments/CommentForm';
import createClientPage from '@/core/client-page';
import { PrivateCloudRequestGetPayload } from '@/queries/private-cloud-requests';
import { getAllPrivateCloudComments } from '@/services/backend/private-cloud/products';
import { getPrivateCloudRequest } from '@/services/backend/private-cloud/requests';
import { privateProductState, usePrivateProductState } from '@/states/global';

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
  const queryClient = useQueryClient();
  const [privateState, privateSnap] = usePrivateProductState();
  const { id: requestId } = pathParams;
  const userId = session?.userId;

  // Fetch the request details to ensure licencePlate is set
  const {
    data: request,
    isLoading: requestLoading,
    isError: requestError,
    error: requestErrorDetails,
  } = useQuery<PrivateCloudRequestGetPayload>({
    queryKey: ['request', requestId],
    queryFn: () => getPrivateCloudRequest(requestId),
    enabled: !!requestId,
  });

  useEffect(() => {
    if (request) {
      privateProductState.currentRequest = request;
      privateProductState.licencePlate = request.licencePlate;
      queryClient.invalidateQueries({
        queryKey: ['comments', request.licencePlate, requestId],
      });
    }
  }, [request, requestId, queryClient]);

  useEffect(() => {
    console.log('Child Page Path Params:', pathParams);
    console.log('Licence Plate:', privateProductState.licencePlate);
  }, [pathParams]);

  // Query for comments
  const {
    data: comments,
    isLoading: commentsLoading,
    isError: commentsIsError,
    error: commentsError,
    refetch: refetchComments,
  } = useQuery({
    queryKey: ['comments', privateProductState.licencePlate, requestId],
    queryFn: () => getAllPrivateCloudComments(privateProductState.licencePlate, requestId),
    enabled: !!privateProductState.licencePlate && !!requestId,
  });

  const handleCommentAdded = () => {
    refetchComments(); // Refresh the comments after adding a new one
  };

  if (requestLoading) return <p>Loading request...</p>;
  if (requestError) return <p>Error loading request: {requestErrorDetails.message}</p>;

  return (
    <div>
      <CommentForm
        licencePlate={privateProductState.licencePlate}
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
              licencePlate={privateProductState.licencePlate}
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
