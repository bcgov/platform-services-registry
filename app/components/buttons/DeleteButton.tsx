import { IconTrash } from '@tabler/icons-react';
import classNames from 'classnames';

export default function DeleteButton({
  canDelete,
  setShowModal,
  active,
}: {
  canDelete: boolean;
  setShowModal: (prevState: boolean) => void;
  active: boolean;
}) {
  return (
    <button
      disabled={!canDelete}
      type="button"
      onClick={() => setShowModal(true)}
      className={classNames(
        'group flex items-center px-4 py-2 text-sm w-full',
        active && canDelete ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
      )}
    >
      <IconTrash className="inlick-block mr-2" />
      Delete
    </button>
  );
}
