// not used

import Image from 'next/image';
import fetchUserImage from '@/components/nav/generateAvatar';
import { useQuery } from '@tanstack/react-query';

export default function Avatar({
  productOwnerEmail,
  primaryTechnicalLeadEmail,
  secondaryTechnicalLeadEmail,
  className = '',
}: {
  productOwnerEmail: string;
  primaryTechnicalLeadEmail: string;
  secondaryTechnicalLeadEmail: string;
  className?: string;
}) {
  const { data: poImageUrl, isLoading: poLoading } = useQuery<string, Error>({
    queryKey: [productOwnerEmail],
    queryFn: () => fetchUserImage(productOwnerEmail),
    enabled: !!productOwnerEmail,
  });

  const { data: tlImageUrl, isLoading: ptlLoading } = useQuery<string, Error>({
    queryKey: [primaryTechnicalLeadEmail],
    queryFn: () => fetchUserImage(primaryTechnicalLeadEmail),
    enabled: !!primaryTechnicalLeadEmail,
  });

  const { data: secondaryTlUrl, isLoading: stlLoading } = useQuery<string, Error>({
    queryKey: [secondaryTechnicalLeadEmail],
    queryFn: () => fetchUserImage(secondaryTechnicalLeadEmail),
    enabled: !!secondaryTechnicalLeadEmail,
  });

  return (
    <div className="flex 3xl:hidden isolate items-center -space-x-2 overflow-hidden ml-10 mt-2">
      <Image
        width={32}
        height={32}
        className="relative z-30 inline-block h-8 w-8 rounded-full ring-2 ring-white"
        src={poImageUrl || 'https://www.gravatar.com/avatar/?d=identicon'}
        alt=""
      />
      <Image
        width={32}
        height={32}
        className="relative z-20 inline-block h-8 w-8 rounded-full ring-2 ring-white"
        src={tlImageUrl || 'https://www.gravatar.com/avatar/?d=identicon'}
        alt=""
      />
      {secondaryTechnicalLeadEmail && (
        <Image
          width={32}
          height={32}
          className="relative z-10 inline-block h-8 w-8 rounded-full ring-2 ring-white"
          src={secondaryTlUrl || 'https://www.gravatar.com/avatar/?d=identicon'}
          alt=""
        />
      )}
    </div>
  );
}
