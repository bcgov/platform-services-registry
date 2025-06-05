import Link from 'next/link';
import { RequestType, DecisionStatus } from '@/prisma/client';
import { formatDateSimple } from '@/utils/js';

export default function PublicHistorySubItem({
  id,
  comment,
  data,
  type,
  status,
  isDecision,
  email,
}: {
  id: string;
  comment: string | null;
  data: Date;
  type: RequestType;
  status: DecisionStatus;
  isDecision: boolean;
  email: string | null;
}) {
  let message = '';

  if (isDecision) {
    if (type === RequestType.EDIT) {
      message += `Edit request was ${status.toLocaleLowerCase()}`;
    } else {
      message += `${type.toLocaleLowerCase()} request was ${status.toLocaleLowerCase()}`;
    }
  } else if (type === RequestType.EDIT) {
    message += `Edit request was submitted`;
  } else {
    message += `${type.toLocaleLowerCase()} request was submitted`;
  }

  const commentLabel = comment ? (isDecision ? 'Decision Comment' : 'Request Comment') : '';

  return (
    <div key={id} className="max-h-full mb-2 grid grid-cols-[20%_5%_70%] gap-x-3 gap-y-2 content-center">
      <div className="max-w-fit ml-auto mr-0 my-auto font-bold">{commentLabel}</div>
      <div className="mx-auto my-0 w-[0.02rem] min-h-[3rem] flex p-0 items-center justify-center border-[0.1rem]  border-bcblue"></div>
      <div className="content-center w-auto">{comment}</div>
      <div className="max-w-fit ml-auto mr-0 my-auto font-bold">{formatDateSimple(data)}</div>
      <div className="mx-auto my-0 w-[2rem] h-[2rem]  flex p-[0.2rem] items-center justify-center border-[0.7rem] rounded-full  border-bcblue"></div>
      <div className="content-center w-auto">
        {message}{' '}
        {email && [
          'by ',
          <Link key={id + 1} className="text-blue-500 hover:text-blue-700" href={`mailto:${email}`}>
            {email}
          </Link>,
        ]}
      </div>
    </div>
  );
}
