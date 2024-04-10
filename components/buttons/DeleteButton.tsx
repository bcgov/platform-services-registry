import { TrashIcon } from '@heroicons/react/20/solid';
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
      <TrashIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
      Delete
    </button>
  );
}
