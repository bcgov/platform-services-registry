import classNames from 'classnames';
import { FieldValues } from 'react-hook-form';
import { $Enums } from '@prisma/client';

export default function ProductBadge({ values }: { values: FieldValues }) {
  // Request Document
  if (values.type) {
    return (
      <span
        className={classNames('text-sm font-medium me-2 px-2.5 py-0.5 rounded no-underline ml-1 float-right', {
          'bg-green-100 text-green-800': values.type === $Enums.RequestType.CREATE,
          'bg-blue-100 text-blue-800': values.type === $Enums.RequestType.EDIT,
          'bg-red-100 text-red-800': values.type === $Enums.RequestType.DELETE,
        })}
      >
        {values.type}
      </span>
    );
  }

  // Product Document
  if (values.status) {
    return (
      <span
        className={classNames(
          'text-sm font-medium me-2 px-2.5 py-0.5 rounded no-underline ml-1 float-right',
          values.status === $Enums.ProjectStatus.ACTIVE ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
        )}
      >
        {values.status}
      </span>
    );
  }

  return null;
}
