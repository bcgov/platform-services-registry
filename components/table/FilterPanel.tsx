import { usePathname, useRouter, useSearchParams, useParams } from 'next/navigation';

const filters = {
  cluster: [
    { value: 'KLAB', label: 'KLAB', checked: false },
    { value: 'CLAB', label: 'CLAB', checked: false },
    { value: 'SILVER', label: 'SILVER', checked: false },
    { value: 'GOLD', label: 'GOLD', checked: false },
  ],
};

export default function FilterPanel() {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams()!;

  const handleClusterFilterChange = (cluster: string | null) => {
    const urlSearchParams = new URLSearchParams(searchParams?.toString());

    if (cluster) {
      urlSearchParams.set('cluster', cluster);
    } else {
      urlSearchParams.delete('cluster');
    }
    urlSearchParams.delete('page');

    replace(`${pathname}?${urlSearchParams.toString()}`);
  };

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 px-4 text-sm sm:px-6 md:gap-x-6 lg:px-8">
      <div className="grid auto-rows-min grid-cols-1 gap-y-10 md:grid-cols-2 md:gap-x-6">
        <fieldset>
          <legend className="block font-medium">Cluster</legend>
          <div className="space-y-6 pt-6 sm:space-y-4 sm:pt-4">
            {filters.cluster.map((option, optionIdx) => (
              <div key={option.value} className="flex items-center text-base sm:text-sm">
                <input
                  id={`price-${optionIdx}`}
                  name="price[]"
                  defaultValue={option.value}
                  type="checkbox"
                  className="h-4 w-4 flex-shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  defaultChecked={option.checked}
                  onChange={(e) => handleClusterFilterChange(e.target.checked ? e.target.value : null)}
                />
                <label htmlFor={`price-${optionIdx}`} className="ml-3 min-w-0 flex-1 text-gray-600">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
