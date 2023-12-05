'use client';

import Image from 'next/image';
import fetchUserImage from '@/components/nav/generateAvatar';
import { useQuery } from '@tanstack/react-query';

export default function Avatar({ name, email, userRole }: { name: string; userRole: string; email: string }) {
  const { data, isLoading, error } = useQuery<string, Error>({
    queryKey: [email + 'image', email],
    queryFn: () => fetchUserImage(email),
    enabled: !!email,
  });

  return (
    <div className="group block flex-shrink-0 px-5">
      <div className="flex items-center">
        <div>
          <Image
            className="inline-block rounded-full"
            layout="fixed"
            width={36}
            height={36}
            src={data || 'https://www.gravatar.com/avatar/?d=identicon'}
            alt=""
          />
        </div>
        <div className="ml-3">
          <p className="text-base font-medium text-gray-700 group-hover:text-gray-900 truncate">{name}</p>
          <p className="text-sm  text-gray-400 group-hover:text-gray-700">{userRole}</p>
        </div>
      </div>
    </div>
  );
}
