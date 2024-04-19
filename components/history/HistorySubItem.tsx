import formatDate from '@/utils/date';
import { $Enums } from '@prisma/client';
import Link from 'next/link';

export default function HistorySubItem({
  id,
  comment,
  data,
  type,
  status,
  isDecision,
  isQuotaChanged,
  email,
}: {
  id: string;
  comment: string;
  data: Date;
  type: $Enums.RequestType;
  status: $Enums.DecisionStatus;
  isDecision: boolean;
  isQuotaChanged: boolean | null;
  email: string | null;
}) {
  let message = '';

  if (isDecision) {
    if (type === $Enums.RequestType.EDIT) {
      message += `Edit request ${
        isQuotaChanged ? 'with upgrade' : 'without'
      } quota change was ${status.toLocaleLowerCase()}`;
    } else {
      message += `${type.toLocaleLowerCase()} request was ${status.toLocaleLowerCase()}`;
    }
  } else {
    if (type === $Enums.RequestType.EDIT) {
      message += `Edit request ${isQuotaChanged ? 'with' : 'without'} quota change was submitted`;
    } else {
      message += `${type.toLocaleLowerCase()} request was submitted`;
    }
  }

  return (
    <div key={id} className="max-h-full mb-2 grid grid-cols-[20%_5%_70%] gap-x-3 gap-y-2 content-center">
      <div className="max-w-fit ml-auto mr-0 my-auto font-bcsans font-bold">
        {isDecision ? 'Decision' : 'Request'} Comment
      </div>
      <div className="mx-auto my-0 w-[0.02rem] min-h-[3rem] flex p-0 items-center justify-center border-[0.1rem]  border-bcblue"></div>
      <div className="content-center w-auto font-bcsans">{comment}</div>
      <div className="max-w-fit ml-auto mr-0 my-auto font-bcsans font-bold">{formatDate(data)}</div>
      <div className="mx-auto my-0 w-[2rem] h-[2rem]  flex p-[0.2rem] items-center justify-center border-[0.7rem] rounded-full  border-bcblue"></div>
      <div className="content-center w-auto font-bcsans">
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
