import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSnapshot } from 'valtio';
import { tabName } from '@/app/api/public-cloud/aws-roles/helpers';
import { publicProductState } from '@/states/global';
import { cn } from '@/utils/js';

export default function PublicUsersTabs({ roles }: { roles: tabName[] }) {
  const snap = useSnapshot(publicProductState);
  const pathname = usePathname();
  if (!roles) {
    return null;
  }

  return (
    <div>
      <span className="isolate inline-flex rounded-md shadow-sm py-2 px-4">
        {roles.map((role: tabName, index: number) => (
          <Link
            key={index}
            href={`/public-cloud/products/${snap.licencePlate}/aws-roles/${role.href}`}
            type="button"
            className={cn(
              (pathname.split('/').includes(role.href) ? 'bg-gray-200 hover:none' : 'bg-white hover:bg-gray-100') +
                (index === 0 ? ' rounded-l-lg' : '') +
                (index === roles.length - 1 ? ' rounded-r-lg' : '') +
                ' min-w-min relative inline-flex justify-center items-center  px-3.5 py-2.5 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300  focus:z-10',
            )}
          >
            {role.name}
          </Link>
        ))}
      </span>
    </div>
  );
}
