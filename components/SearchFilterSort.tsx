import Image from "next/image";
import Search from "@/components/assets/search.svg";
import Filter from "@/components/assets/filter.svg";
import Export from "@/components/assets/Export.svg";

export default function SearchFilterSort() {
  return (
    <div className="flex justify-end space-x-2.5">
      <form className="flex-grow flex-shrink max-w-sm">
        <label htmlFor="simple-search" className="sr-only">
          Search
        </label>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Image
              alt="Search"
              src={Search}
              width={15}
              height={15}
              style={{
                maxWidth: "100%",
                height: "auto"
              }}
            />
          </div>
          <input
            type="text"
            id="simple-search"
            className="w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block pl-9 p-1.5   dark:border-gray-300 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search"
            required
          />
        </div>
      </form>
      <button
        type="button"
        className=" inline-flex items-center gap-x-2 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-darkergrey shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
      >
        <Image
          alt="Vercel logo"
          src={Filter}
          width={16}
          height={10}
          style={{
            maxWidth: "100%",
            height: "auto"
          }}
        />
        <span className="md:inline hidden">Filters</span>
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-x-2 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-darkergrey shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
      >
        <Image
          alt="Vercel logo"
          src={Export}
          width={16}
          height={12.5}
          style={{
            maxWidth: "100%",
            height: "auto"
          }}
        />
        <span className="md:inline hidden">Export</span>
      </button>
    </div>
  );
}
