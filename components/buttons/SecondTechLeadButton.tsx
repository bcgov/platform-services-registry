import Image from 'next/image';
import Minus from '@/components/assets/minus.svg';
import Plus from '@/components/assets/plus.svg';

export default function Button({ clicked, onClick }: { clicked: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} aria-hidden="true">
      {clicked ? (
        <span className="flex items-center w-7/12 max-w-3xl rounded-md bg-bcorange px-4 py-2 h-10 text-bcsans text-bcblue text-xs font-light tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          <Image src={Minus} alt="minus" width={20} height={20} className="mr-2" />
          REMOVE SECONDARY TECHNICAL LEAD
        </span>
      ) : (
        <span className="flex items-center w-7/12 max-w-3xl rounded-md bg-bcorange px-4 py-2 h-10 text-bcsans text-bcblue text-xs font-light tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          <Image src={Plus} alt="plus" width={20} height={20} className="mr-2" />
          ADD SECONDARY TECHNICAL LEAD
        </span>
      )}
    </div>
  );
}
