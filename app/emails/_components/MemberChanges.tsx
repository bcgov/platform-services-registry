import { Heading, Text } from '@react-email/components';
import { DiffChange } from '@/utils/diff';
import { toOrdinal } from '@/utils/number';

function FieldValue({ value }: { value: string }) {
  if (value) {
    return <span className="font-semibold">{value}</span>;
  }

  return <span className="italic underline">empty</span>;
}

export default function MemberChanges({ data }: { data: DiffChange[] }) {
  return (
    <div>
      <Heading className="text-lg text-black">Members Changes</Heading>
      {data.map((row) => {
        const [, num, field] = row.path;
        return (
          <div key={row.loc}>
            <Text className="mb-2 font-semibold h-4">{`${toOrdinal(Number(num) + 1)} member's ${field}`}</Text>
            <Text className="mt-1 h-fit">
              from <FieldValue value={row.oldVal} /> to <FieldValue value={row.newVal} />
            </Text>
          </div>
        );
      })}
    </div>
  );
}
