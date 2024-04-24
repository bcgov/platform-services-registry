import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface ChatBubbleProps {
  firstName: string;
  lastName: string;
  timestamp: Date;
  text: string;
  isUser: boolean;
}

const CommentBubble: React.FC<ChatBubbleProps> = ({ firstName, lastName, timestamp, text, isUser }) => {
  const bubbleStyles = 'relative max-w-xl mx-auto my-2 bg-white rounded-lg border border-blue-200 ';

  // Styles for the header
  const headerStyles = 'px-4 py-1 bg-blue-100 text-gray-700 text-xs';

  // Styles for the body of the bubble
  const bodyStyles = 'p-4 text-gray-700';

  const tailStyles = isUser
    ? 'absolute top-3 right-0 w-0 h-0 border-l-[10px] border-l-transparent border-b-[10px] border-b-transparent border-t-[10px] border-t-blue-300 transform translate-x-1/4 -translate-y-1/3 rotate-45'
    : '';

  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });

  return (
    <div className={bubbleStyles}>
      <div className={headerStyles}>
        <span>
          {firstName} {lastName} <span className="commented-text">commented</span>{' '}
        </span>
        <span>{timeAgo}</span>
      </div>
      <div className={bodyStyles}>
        <p>{text}</p>
      </div>
      {isUser && <div className={tailStyles}></div>}
    </div>
  );
};

export default CommentBubble;
