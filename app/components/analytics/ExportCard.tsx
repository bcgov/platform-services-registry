import ExportButton from '@/components/buttons/ExportButton';

export default function ExportCard({ title, apiEnpoint }: { title: string; apiEnpoint: string }) {
  return (
    <div className="flex flex-col items-end border rounded-lg w-fit p-4">
      <div>
        <h2>{title}</h2>
        <ExportButton className="mt-3" downloadUrl={apiEnpoint} />
      </div>
    </div>
  );
}
