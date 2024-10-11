'use client';

import { Button } from '@mantine/core';
import { IconPhoto, IconDownload } from '@tabler/icons-react';
import classNames from 'classnames';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';

const colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark'];
const variants = ['filled', 'light', 'outline'];
const sizes = ['xl', 'compact-xl', 'lg', 'compact-lg', 'md', 'compact-md', 'sm', 'compact-sm', 'xs', 'compact-xs'];

const buttonPage = createClientPage({
  roles: [GlobalRole.User],
});
export default buttonPage(() => {
  return (
    <>
      <h1 className="font-bold text-2xl mt-4 mb-5">Text Input</h1>
      <div className={classNames('grid grid-cols-1 md:gap-4 md:py-2', `md:grid-cols-${colors.length}`)}>
        {colors.map((color) => {
          return (
            <div className="col-span-1" key={color}>
              {variants.map((variant) => {
                return sizes.map((size) => {
                  return (
                    <div className="mb-3" key={color + variant + size}>
                      <div className="text-gray-800 text-sm font-bold">
                        {color} - {variant} - {size}
                      </div>
                      <Button color={color} variant={variant} size={size}>
                        {color}
                      </Button>
                    </div>
                  );
                });
              })}

              <div className="mb-3">
                <div className="text-gray-800 text-sm font-bold">{color} - full width</div>
                <Button color={color} variant={variants[0]} fullWidth>
                  {color}
                </Button>
              </div>

              <div className="mb-3">
                <div className="text-gray-800 text-sm font-bold">{color} - disabled</div>
                <Button color={color} variant={variants[0]} disabled>
                  {color}
                </Button>
              </div>

              <div className="mb-3">
                <div className="text-gray-800 text-sm font-bold">{color} - loading</div>
                <Button color={color} variant={variants[0]} loading>
                  {color}
                </Button>
              </div>

              <div className="mb-3">
                <div className="text-gray-800 text-sm font-bold">{color} - left icon</div>
                <Button color={color} variant={variants[0]} leftSection={<IconPhoto size={14} />}>
                  {color}
                </Button>
              </div>

              <div className="mb-3">
                <div className="text-gray-800 text-sm font-bold">{color} - right icon</div>
                <Button color={color} variant={variants[0]} rightSection={<IconDownload size={14} />}>
                  {color}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
});
