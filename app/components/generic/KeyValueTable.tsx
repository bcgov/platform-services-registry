import _isEmpty from 'lodash-es/isEmpty';
import _isPlainObject from 'lodash-es/isPlainObject';

export default function KeyValueTable({ data, showHeader = true }: { data: any; showHeader?: boolean }) {
  if (!_isPlainObject(data)) return String(data);
  if (_isEmpty(data)) return null;

  return (
    <table className="table-auto border-collapse border border-gray-300 w-full">
      {showHeader && (
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-1 bg-gray-100 text-left">Field</th>
            <th className="border border-gray-300 px-4 py-1 bg-gray-100 text-left">Value</th>
          </tr>
        </thead>
      )}
      <tbody>
        {Object.entries(data).map(([key, value]) => (
          <tr key={key}>
            <td className="border border-gray-300 px-4 py-1 text-gray-700 align-top">{key}</td>
            <td className="border border-gray-300 px-4 py-1 text-gray-700 whitespace-pre-wrap break-words max-w-[400px]">
              <KeyValueTable data={value} showHeader={showHeader} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
