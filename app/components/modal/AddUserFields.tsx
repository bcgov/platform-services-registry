interface Props {
  name: string;
  value: string;
}

export default function UserInfoField({ name, value }: Props) {
  return (
    <div className="mt-8 col-span-full">
      <span className="block text-sm font-medium leading-6 text-gray-900">{name}</span>
      <div className="mt-2">
        <p className="block w-full rounded-md border-0 p-1.5 text-slate-400 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
          {value ? value : 'Autofilled from IDIR'}
        </p>
      </div>
    </div>
  );
}
