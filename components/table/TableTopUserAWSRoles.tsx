import AddUserButton from '@/components/buttons/AddUserButton';
import PublicUsersTabs from '@/components/tabs/PublicUsersTabs';

export default function UserAWSRolesTableTop({
  title,
  subtitle,
  description,
}: {
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <div className="mx-auto w-full pt-6">
      <h1 className="font-bcsans px-4  text-xl lg:text-2xl 2xl:text-4xl font-semibold leading-7 text-gray-900 mb-8 lg:mt-14">
        {title}
      </h1>
      <div className="sm:flex sm:items-center pb-5 border-b-2 px-4 ">
        <div className="sm:flex-auto ">
          <h1 className="text-lg font-bcsans font-bold leading-6 text-gray-900">{subtitle}</h1>
          <p className="mt-2 text-sm font-bcsans text-gray-700">{description}</p>
        </div>
        <AddUserButton />
      </div>
      <PublicUsersTabs />
    </div>
  );
}
