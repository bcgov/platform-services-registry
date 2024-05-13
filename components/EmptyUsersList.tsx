import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Empty from '@/components/assets/empty.svg';
import AddUserButton from '@/components/buttons/AddUserButton';

export default function EmptyBody({
  userRole,
  setOpenAddUser,
}: {
  userRole: string;
  setOpenAddUser: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const pathname = usePathname();

  if (!pathname) return null;
  return (
    <div className="flex flex-col items-center justify-center py-12 mt-12">
      <Image
        alt="Empty"
        src={Empty}
        width={172}
        height={128}
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />
      <span className="font-bcsans text-xl font-bold text-mediumgrey mt-4">There are no users to be displayed</span>
      <span className="font-bcsans text-lg font-extralight text-mediumgrey mt-2">
        You currently have no users for {userRole} role
      </span>
      <div className="pt-6">
        <AddUserButton setOpenAddUser={setOpenAddUser} />
      </div>
    </div>
  );
}
