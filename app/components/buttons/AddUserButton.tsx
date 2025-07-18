import { IconCirclePlus } from '@tabler/icons-react';

interface Props {
  setOpenAddUser: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AddUserButton({ setOpenAddUser }: Props) {
  return (
    <button
      className="flex justify-center pr-2 items-center rounded-md bg-bcorange px-4 py-2 h-10 text-bcblue text-base font-light tracking-[.2em] shadow-xs hover:brightness-110 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm sm:px-3 sm:tracking-[.1em]"
      type="button"
      onClick={() => setOpenAddUser(true)}
    >
      <IconCirclePlus size={20} className="mr-2" />
      ADD A USER
    </button>
  );
}
