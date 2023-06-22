import classNames from "@/components/utils/classnames";

const tabs = [
  { name: "PRIVATE CLOUD OPENSHIFT", href: "#", current: true },
  { name: "PUBLIC CLOUD LANDING ZONES", href: "#", current: false }
];

export default function Tabs({ className }: { className?: string }) {
  return (
    <div className="w-full">
      <div className="md:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <select
          id="tabs"
          name="tabs"
          className="font-bcsans text-xl block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          defaultValue={tabs.find((tab) => tab.current)?.name}
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden md:block  justify-start">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex justify-start" aria-label="Tabs">
            {tabs.map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                style={{ height: 68, marginLeft: 74 }}
                className={classNames(
                  tab.current
                    ? "relative border-bcorange text-bcblue before:content-[''] before:absolute before:w-2/4 before:border-b-3 before:border-bcorange before:bottom-0 before:left-1/2 before:-translate-x-1/2"
                    : "relative border-transparent text-gray-300 hover:before:content-[''] hover:before:absolute hover:before:w-2/4 hover:before:border-b-3 hover:before:border-gray-300 hover:before:bottom-0 hover:before:left-1/2 hover:before:-translate-x-1/2",
                  "lg:mx-20 w-50 px-1 py-5 text-center font-bcsans text-lg font-bold"
                )}
                aria-current={tab.current ? "page" : undefined}
              >
                {tab.name}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
