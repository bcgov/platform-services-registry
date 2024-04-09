// not used

import Image from 'next/image';
import fetchUserImage from '@/components/nav/generateAvatar';
import { useQuery } from '@tanstack/react-query';

function Avatar({ name, email }: { name: string; email: string }) {
  const { data, isLoading, error } = useQuery<string, Error>({
    queryKey: ['userImage', email],
    queryFn: () => fetchUserImage(email),
    enabled: !!email,
  });

  return (
    <div className="flex items-center">
      <div className="h-9 w-9">
        <Image
          className="inline-block rounded-full"
          layout="fixed"
          width={100}
          height={100}
          src={data || 'https://www.gravatar.com/avatar/?d=identicon'}
          alt=""
        />
      </div>
      <div className="ml-3">
        <p className="text-base  text-gray-700 group-hover:text-gray-900">{name}</p>
        {/* <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">{email}</p> */}
      </div>
    </div>
  );
}

type User = {
  name: string;
  email: string;
};

export default function StackedAvatars({ users }: { users: User[] }) {
  const [po, ...tls] = users;

  return (
    <div className="flex gap-x-3">
      {' '}
      {/* Added gap-x-3 for spacing between columns */}
      <div>
        <Avatar name={po.name} email={po.email} />
      </div>
      <div className="flex flex-col items-start gap-y-3">
        {tls.map((user) => (
          <Avatar key={user.email} name={user.name} email={user.email} />
        ))}
      </div>
    </div>
  );
}
