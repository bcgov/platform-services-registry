import classNames from 'classnames';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getUserImage } from '@/helpers/user-image';

export default function ProfileImage({
  image,
  email,
  className,
  size = 480,
}: {
  image?: string;
  email: string;
  className?: string;
  size?: number;
}) {
  const [imageUrl, setImageUrl] = useState('https://www.gravatar.com/avatar/?d=identicon');

  useEffect(() => {
    (async () => {
      const imgUrl = await getUserImage(email, image);
      if (imgUrl) setImageUrl(imgUrl);
    })();
  }, [email, image]);

  return (
    <Image
      className={classNames('h-10 w-10 rounded-full', className)}
      width={size}
      height={size}
      src={imageUrl}
      alt="Profile Image"
    />
  );
}
