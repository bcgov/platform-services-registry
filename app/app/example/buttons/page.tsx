'use client';

import { MantineProvider, Button } from '@mantine/core';
import React from 'react';
import { theme } from '@/components/buttons/mantine-theme';

const ButtonsPage = () => {
  const buttonConfigurations = [
    { type: 'primary', label: 'Primary' },
    { type: 'secondary', label: 'Secondary' },
    { type: 'success', label: 'Success' },
    { type: 'danger', label: 'Danger' },
    { type: 'warning', label: 'Warning' },
    { type: 'info', label: 'Info' },
  ];

  const buttonSizes = [
    { size: 'xl', label: 'XL' },
    { size: 'lg', label: 'LG' },
    { size: 'md', label: 'MD' },
    { size: 'sm', label: 'SM' },
    { size: 'xs', label: 'XS' },
  ];

  const items = [];
  for (let counter = 0; counter < 10; counter++) {
    items.push(
      <div style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '50px' }}>
        {buttonConfigurations.map((config) => (
          <div key={config.type}>
            <h2>{`${config.label} Button, #${counter + 1}:`}</h2>
            <br />
            {['filled', 'outline'].map((filling) =>
              ['button', 'disabled', 'loading'].map((variant) => (
                <React.Fragment key={variant}>
                  <>{`${variant} ${filling}:`}</>
                  <br />
                  <Button
                    variant={filling}
                    color={`${config.type}.${counter}`}
                    disabled={variant.includes('disabled')}
                    loading={variant.includes('loading')}
                  >
                    {`${config.label} Button ${variant}`}
                  </Button>
                  <br />
                  <></>
                  <br />
                </React.Fragment>
              )),
            )}

            {['filled', 'outline'].map((filling) =>
              buttonSizes.map((size) => (
                <React.Fragment key={size.size}>
                  <Button variant={filling} color={`${config.type}.${counter}`} size={size.size}>
                    {`${size.label} Button`}
                  </Button>
                  <br />
                  <></>
                  <br />
                </React.Fragment>
              )),
            )}
          </div>
        ))}
      </div>,
    );
  }

  return (
    <MantineProvider theme={theme}>
      <h1 style={{ fontWeight: 'bold' }}>
        Suggestions of easier to maintain Mantine buttons from the task description
      </h1>
      {items}
    </MantineProvider>
  );
};

export default ButtonsPage;
