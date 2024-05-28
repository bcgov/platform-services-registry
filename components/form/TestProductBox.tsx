import { Tooltip, Badge } from '@mantine/core';
import { differenceInDays } from 'date-fns/differenceInDays';

export default function TestProductBox({
  data,
  className,
}: {
  data?: {
    created: Date;
  };
  className?: string;
}) {
  if (!data) return null;
  const diffInDays = 30 - differenceInDays(new Date(), new Date(data.created));

  return (
    <Tooltip label="Delete Product" position="top" offset={10} className={className}>
      <button
        type="button"
        className="text-gray-900 bg-white border-solid border-2 border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5"
        onClick={(e) => {
          console.log('delete product');
        }}
      >
        <Badge autoContrast size="xl" color="blue" radius="md" className="mb-1">
          Test
        </Badge>
        <span className="text-red-600/100 font-black block text-lg">{Math.abs(diffInDays)}</span>
        {diffInDays > 0 ? 'days until product deletion' : 'days ago product should be deleted'}
      </button>
    </Tooltip>
  );
}
