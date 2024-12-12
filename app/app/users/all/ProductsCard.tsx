import { HoverCard, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useSession } from 'next-auth/react';
import ExternalLink from '@/components/generic/button/ExternalLink';
import { cn } from '@/utils/js';

export default function ProductsCard({
  products = [],
  className = '',
  context,
  children,
}: {
  products: { name: string; licencePlate: string }[];
  className?: string;
  context: 'private-cloud' | 'public-cloud';
  children: React.ReactNode;
}) {
  const [opened, { close, open }] = useDisclosure(false);
  const { data: session } = useSession();

  const title = context === 'private-cloud' ? 'Private Cloud Products' : 'Public Cloud Products';

  const emptyMessage =
    context === 'private-cloud' ? 'No private cloud products associated.' : 'No public cloud products associated.';

  const baseUrl = `/${context}/products/`;

  return (
    <HoverCard shadow="md" position="top">
      <HoverCard.Target>
        <div className={cn('cursor-help inline-block', className)} onMouseEnter={open} onMouseLeave={close}>
          {children}
        </div>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <div className="overflow-y-auto max-h-80">
          {products.length === 0 ? (
            <div className="italic text-sm">{emptyMessage}</div>
          ) : (
            <>
              <div className="mb-2 underline">{title}</div>
              {products.map((product) => {
                return (
                  <div
                    key={product.licencePlate}
                    className="hover:bg-gray-100 transition-colors duration-200 grid grid-cols-5 gap-4 px-2 py-1 text-sm"
                  >
                    <div className="col-span-4">
                      <div>
                        <span className="font-semibold">{product.name}</span>
                      </div>
                    </div>
                    <div className="col-span-1 text-right">
                      {session?.permissions.editUsers && (
                        <ExternalLink href={`${baseUrl}/${product.licencePlate}/edit`} />
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
