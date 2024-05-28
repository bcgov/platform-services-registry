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
    <div className={className}>
      <div className="">
        <div className="text-base font-medium text-gray-700 group-hover:text-gray-900 truncate ">{name}</div>
        <div className="text-sm text-gray-400 group-hover:text-gray-700">{userRole}</div>
      </div>
    </div>
  );
}
