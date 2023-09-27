import Link from "next/link";
import { useFormContext } from "react-hook-form";

type QuotaOptions = {
  [key: string]: string;
};

const defaultCpuOptionsLookup: QuotaOptions = {
  CPU_REQUEST_0_5_LIMIT_1_5: "0.5 CPU Request, 1.5 CPU Limit",
  CPU_REQUEST_1_LIMIT_2: "1 CPU Request, 2 CPU Limit",
  CPU_REQUEST_2_LIMIT_4: "2 CPU Request, 4 CPU Limit",
  CPU_REQUEST_4_LIMIT_8: "4 CPU Request, 8 CPU Limit",
  CPU_REQUEST_8_LIMIT_16: "8 CPU Request, 16 CPU Limit",
  CPU_REQUEST_16_LIMIT_32: "16 CPU Request, 32 CPU Limit",
  CPU_REQUEST_32_LIMIT_64: "32 CPU Request, 64 CPU Limit"
};

const defaultMemoryOptionsLookup: QuotaOptions = {
  MEMORY_REQUEST_2_LIMIT_4: "2 GB Request, 4 GB Limit",
  MEMORY_REQUEST_4_LIMIT_8: "4 GB Request, 8 GB Limit",
  MEMORY_REQUEST_8_LIMIT_16: "8 GB Request, 16 GB Limit",
  MEMORY_REQUEST_16_LIMIT_32: "16 GB Request, 32 GB Limit",
  MEMORY_REQUEST_32_LIMIT_64: "32 GB Request, 64 GB Limit",
  MEMORY_REQUEST_64_LIMIT_128: "64 GB Request, 128 GB Limit"
};

const defaultStorageOptionsLookup: QuotaOptions = {
  STORAGE_1: "1 GB",
  STORAGE_2: "2 GB",
  STORAGE_4: "4 GB",
  STORAGE_16: "16 GB",
  STORAGE_32: "32 GB",
  STORAGE_64: "64 GB",
  STORAGE_128: "128 GB",
  STORAGE_256: "256 GB",
  STORAGE_512: "512 GB"
};

type QuotaOptionsLookup = {
  cpu: QuotaOptions;
  memory: QuotaOptions;
  storage: QuotaOptions;
};

const quotaOptionsLookup: QuotaOptionsLookup = {
  cpu: defaultCpuOptionsLookup,
  memory: defaultMemoryOptionsLookup,
  storage: defaultStorageOptionsLookup
};

function QuotaInput({
  quotaName,
  nameSpace,
  licensePlate,
  selectOptions
}: {
  quotaName: "cpu" | "memory" | "storage";
  nameSpace: "production" | "test" | "development" | "tools";
  licensePlate: string;
  selectOptions: QuotaOptions;
}) {
  const {
    register,
    formState: { errors },
    values
  } = useFormContext();

  // Make quotaName start with uppercase letter
  const quotaNameStartUpperCase =
    quotaName.charAt(0).toUpperCase() + quotaName.slice(1);

  return (
    <div className="mb-4">
      <label
        htmlFor={quotaName}
        className="block text-sm leading-6 font-bold text-gray-900 mt-8"
      >
        {quotaName.toUpperCase()}
      </label>
      <div className="mt-2">
        <select
          defaultValue={""}
          id="cpu"
          {...register(nameSpace + "Quota." + quotaName)}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          <option value="" disabled>
            Select {quotaNameStartUpperCase}
          </option>
          {Object.entries(selectOptions).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
          {/* <option value="CUSTOM">Custom</option> */}
        </select>
        {errors?.[nameSpace + "Quota"]?.[quotaName] && (
          <p className="text-red-400 mt-3 text-sm leading-6">
            Select the {quotaName} for the {nameSpace} namespace
          </p>
        )}
        <p className="mt-3 text-sm leading-6 text-gray-700">
          <b>Current CPU:</b>
        </p>
        <p className="mt-3 text-sm leading-6 text-gray-700">
          <b>Requested CPU:</b>
        </p>
      </div>
    </div>
  );
}

export default function Quotas({ licensePlate }: { licensePlate: string }) {
  return (
    <div className="border-b border-gray-900/10 pb-14">
      <h2 className="font-bcsans text-base lg:text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900 2xl:mt-14">
        3. Quotas
      </h2>
      <p className="font-bcsans text-base leading-6 mt-5">
        All quota increase requests require <b>Platform Services Team’s</b>
        approval must have supporting information as per the Quota Increase
        Request Process. The Quota Requests without supporting information
        <b> will</b> not be processed.
      </p>
      <div className="mt-10 grid grid-cols-1 gap-x-8 xl:gap-x-16 gap-y-8 sm:grid-cols-8 ">
        {(["production", "test", "tools", "development"] as const).map(
          (nameSpace) => (
            <div className="sm:col-span-2" key={nameSpace}>
              <h3 className="font-bcsans text-base 2xl:text-lg font-semibold leading-7 text-gray-900">
                {nameSpace.charAt(0).toUpperCase() + nameSpace.slice(1)}{" "}
                Namespace
              </h3>
              <Link href="#">{licensePlate}-prod</Link>
              {(["cpu", "memory", "storage"] as const).map((quotaName) => (
                <QuotaInput
                  key={quotaName}
                  quotaName={quotaName}
                  selectOptions={quotaOptionsLookup[quotaName]}
                  licensePlate={licensePlate}
                  nameSpace={nameSpace}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
