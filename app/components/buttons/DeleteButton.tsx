import { Button } from '@mantine/core';
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
    <Button color="danger" size="sm" disabled={!canDelete} onClick={() => setShowModal(true)}>
      <IconTrash className="inlick-block mr-2" />
      Delete
    </Button>
  );
}
