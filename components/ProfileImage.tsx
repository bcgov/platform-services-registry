import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getUserImage } from '@/helpers/user-image';

export default function ProfileImage({ image, email }: { image?: string; email: string }) {
  const [imageUrl, setImageUrl] = useState('https://www.gravatar.com/avatar/?d=identicon');

  useEffect(() => {
    (async () => {
      const imgUrl = await getUserImage(email, image);
      if (imgUrl) setImageUrl(imgUrl);
    })();
  }, [email, image]);

  return <Image className="h-10 w-10 rounded-full" width={120} height={120} src={imageUrl} alt="Profile Image" />;
}
