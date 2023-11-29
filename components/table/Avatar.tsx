'use client';

import Image from 'next/image';
import fetchUserImage from '@/components/nav/generateAvatar';
import { useQuery } from '@tanstack/react-query';

export default function Avatar({ name, email }: { name: string; email: string }) {
  const { data, isLoading, error } = useQuery<string, Error>({
    queryKey: ['userImage', email],
    queryFn: () => fetchUserImage('oamar.kanji@gov.bc.ca'),
    enabled: !!email,
  });

  return (
    <div className="flex items-center mx-2">
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
        <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{name}</p>
        <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">{email}</p>
      </div>
    </div>
  );
}
