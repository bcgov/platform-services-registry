import _castArray from 'lodash-es/castArray';
import _compact from 'lodash-es/compact';
import _sortBy from 'lodash-es/sortBy';
import _startCase from 'lodash-es/startCase';
import _uniq from 'lodash-es/uniq';
import { useSession } from 'next-auth/react';
import Modal from '@/components/generic/modal/Modal';
import ProfileImage from '../ProfileImage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const formatWords = (arr: string[]) => _sortBy(_uniq(_compact(_castArray(arr)))).map(_startCase);

export default function UserProfilePopUp({ isOpen, onClose }: Props) {
  const { data: session } = useSession();

  if (!session) return null;

  const allowedPermissions = Object.keys(session.permissions).filter(
    (key) => session.permissions[key as keyof typeof session.permissions],
  );

  const roles = formatWords(session.roles);
  const permissions = formatWords(allowedPermissions);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="sm:max-w-[40rem]">
      <div>
        <ProfileImage
          email={session.user.email ?? ''}
          image={session.user.image ?? ''}
          size={400}
          className="h-20 w-20 mx-auto mb-2"
        />
      </div>

      <div className="text-center text-xl leading-6 font-bold text-gray-900 mb-2">{session.user.name}</div>
      <div className="text-center text-lg mb-3">{session.user.email}</div>

      <div className="grid grid-cols-1 md:grid-cols-3 md:gap-4 text-gray-500 mb-3 max-w-lg mx-auto">
        <div className="col-span-1">
          <div className="font-bold">Roles:</div>
          <ul className="list-disc text-sm">
            {roles.map((role) => (
              <li key={role}>{role}</li>
            ))}
          </ul>
        </div>

        <div className="col-span-2">
          <div className="font-bold">Permissions:</div>
          <ul className="list-disc text-sm">
            {permissions.map((perm) => (
              <li key={perm}>{perm}</li>
            ))}
          </ul>
        </div>
      </div>

      <button
        type="button"
        className="mt-4 inline-flex w-full justify-center rounded-md bg-bcorange px-4 py-2 text-sm text-bcblue shadow-sm hover:bg-bcorange-dark tracking-[.2em] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        onClick={onClose}
      >
        Close
      </button>
    </Modal>
  );
}
