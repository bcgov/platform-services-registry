export default function Avatar({
  name,
  email,
  userRole,
  className = '',
}: {
  name: string;
  email: string;
  userRole: string;
  className?: string;
}) {
  return (
    <div className={'group block flex-shrink-0 px-2 w-50 overflow-hidden ' + className}>
      <div className="flex items-center">
        <div className="ml-3">
          {/* <p className="text-base font-medium text-gray-700 group-hover:text-gray-900 truncate lg:block hidden">
            {name}
          </p> */}
          <p className="text-base font-medium text-gray-700 group-hover:text-gray-900 truncate ">{name}</p>
          <p className="text-sm text-gray-400 group-hover:text-gray-700">{userRole}</p>
        </div>
      </div>
    </div>
  );
}
