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
        'group flex items-center px-4 py-2 text-sm w-full rounded-md',
        active && canDelete
          ? 'bg-red-500 font-bold text-gray-100 hover:bg-red-700 transition-colors duration-300 ease-in-out'
          : 'bg-gray-100 text-gray-900',
      )}
    >
      <IconTrash className="inlick-block mr-2" />
      Delete
    </button>
  );
}
