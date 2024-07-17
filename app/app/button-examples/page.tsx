import { Disclosure, DisclosureButton } from '@headlessui/react';
import { MantineProvider, Button } from '@mantine/core';
import { IconFilter, IconArrowBack, IconCirclePlus, IconCircleMinus } from '@tabler/icons-react';
import Link from 'next/link';
import React from 'react';
import LightButton from '@/components/generic/button/LightButton';
import { theme } from '../../components/buttons/mantine-theme'; // Path to your custom theme file

const ButtonsPage = () => {
  return (
    <MantineProvider theme={theme}>
      <h1 style={{ fontWeight: 'bold' }}>Same as current but managed by Mantine custom generic theme</h1>
      <div style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '50px' }}>
        <div>
          <> Login button:</>
          <br />
          <></>
          <LightButton>Login</LightButton>
        </div>
        <br />
        <></>
        <div>
          <>Request a New Product Button:</>
          <br />
          <Button variant="filled-orange">
            <IconCirclePlus size={20} className="mr-2" />
            REQUEST A NEW PRODUCT
          </Button>
          <br />
          <></>
        </div>
        <div>
          <br />
          <></>
          Filter button:
          <br />
          <></>
          <Disclosure>
            <DisclosureButton as={LightButton} type="button" className="pr-6">
              <IconFilter size={20} />
              Filter
            </DisclosureButton>
            <></>
            <br />
          </Disclosure>
          <></>
          <br />
        </div>
        <div>
          Clear Filters button: <br />
          <></>
          <Button variant="filled-blue">Clear Filters</Button>
        </div>
        <br />
        <></>
        <br />
        <div>
          Previous button:
          <br />
          <LightButton>Previous</LightButton>
          <br />
          <></>
          <br />
          Previous button inactive:
          <br />
          <LightButton disabled>Previous</LightButton>
        </div>
        <br />
        <></>

        <br />
        <div>
          Next button:
          <br />
          <LightButton>Next</LightButton>
          <br />
          <></>
          <br />
          Next button inactive:
          <br />
          <LightButton disabled>Next</LightButton>
        </div>
        <br />
        <></>
        <br />

        <br />
        <></>
        <br />
        <div></div>
      </div>
      <h1 style={{ fontWeight: 'bold' }}>
        <br />
        <></>Current Buttons
      </h1>
      <div style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '50px' }}>
        <div>
          <> Login button:</>
          <br />
          <></>
          <LightButton>Login</LightButton>
          <br />
        </div>
        <div>
          <>Request a New Product Button:</>
          <br />
          <Link
            className="flex justify-center pr-8 items-center rounded-md bg-bcorange px-4 py-2 h-10 text-bcblue text-base font-light tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm  sm:tracking-[.1em]"
            style={{ width: '282.83px' }}
            type="button"
            href=""
          >
            <IconCirclePlus size={20} className="mr-2" />
            REQUEST A NEW PRODUCT
          </Link>
          <>Request a New Product Button made with new Mantine Theme:</>
          <br />
          <Button variant="bc-orange" color={`primary.${0}`}>
            <IconCirclePlus size={20} className="mr-2" />
            REQUEST A NEW PRODUCT
          </Button>
          <></>
        </div>
        <div>
          <br />
          <Disclosure>
            <DisclosureButton as={LightButton} type="button" className="pr-6">
              <IconFilter size={20} />
              Filter
            </DisclosureButton>
            <></>
            <br />
          </Disclosure>
          <></>
          <br />
        </div>

        <div>
          <button
            className="min-w-max w-1/2 h-9 inline-flex items-center justify-center gap-x-2 rounded-md bg-bcblue text-white px-3 text-sm font-semibold shadow-sm ring-1 ring-inset transition-all duration-500 ring-gray-300 hover:bg-[#CCCCCE]"
            style={{ width: '130.48px' }}
          >
            Clear Filters
          </button>
          <></>
          <br />
        </div>
        <></>
        <br />
        <></>
        <div>
          <button
            className={`relative ml-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300
        ${true ? 'text-gray-500 border-gray-500' : 'text-black border-black'}`}
            disabled={true}
          >
            Previous
          </button>
          <></>
          <br />
          <></>
          <br />
          <button
            className={`relative ml-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300
         'text-gray-500 border-gray-500'}`}
          >
            Previous
          </button>
          <></>
          <br />
        </div>
        <></>
        <br />
        <div>
          <button
            className={`relative ml-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300
        ${true ? 'text-gray-500 border-gray-500' : 'text-black border-black'}`}
            disabled={true}
          >
            Next
          </button>
          <></>
          <br />
          <></>
          <br />
          <button
            className={`relative ml-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300
          'text-gray-500 border-gray-500' `}
          >
            Next
          </button>
        </div>
        <></>
        <br />
        <LightButton className="my-2">
          <IconArrowBack className="inline-block" />
          Back to Products
        </LightButton>
        <></>
        <br />
        <div>
          Current Remove button
          <span
            className="flex items-center w-7/12 max-w-3xl rounded-md bg-bcorange px-4 py-2 h-10 text-bcsans text-bcblue text-xs font-light tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            style={{ width: '400px' }}
          >
            <IconCircleMinus size={20} className="mr-2" />
            REMOVE SECONDARY TECHNICAL LEAD
          </span>
          <></>
          <br />
          <>Remove Secondary TL Button made with new Mantine Theme:</>
          <br />
          <Button variant="bc-orange" color={`primary.${0}`} style={{ fontSize: '0.75rem' }}>
            <IconCircleMinus size={20} className="mr-2" />
            REMOVE SECONDARY TECHNICAL LEAD
          </Button>
          <> </>
          <br />
          <></>
        </div>
        <br />
        <div>
          Current add button:
          <span
            className="flex items-center w-7/12 max-w-3xl rounded-md bg-bcorange px-4 py-2 h-10 text-bcsans text-bcblue text-xs font-light tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            style={{ width: '400px' }}
          >
            <IconCirclePlus size={20} className="mr-2" />
            ADD SECONDARY TECHNICAL LEAD
          </span>
          <br />
          <>Add Secondary TL Button made with new Mantine Theme:</>
          <br />
          <Button variant="bc-orange" color={`primary.${0}`} style={{ fontSize: '0.75rem' }}>
            <IconCirclePlus size={20} className="mr-2" />
            ADD SECONDARY TECHNICAL LEAD
          </Button>
          <></>
          <br />
        </div>
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md bg-bcorange h-10 px-4 py-2 text-sm text-bcblue shadow-sm hover:bg-bcorange-dark tracking-[.2em] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          style={{ width: '226px' }}
        >
          Yes
        </button>
        <> </>
        <br />
        <> </>
        <br />
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white h-10 px-4 py-2 text-sm text-bcblue shadow-sm hover:hover:bg-gray-50 tracking-[.2em] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          style={{ width: '226px' }}
        >
          No
        </button>
        <> </>
        <br />
        <> </>
        <br />
      </div>

      <h1 style={{ fontWeight: 'bold' }}>
        Suggestions of easier to maintain Mantine buttons from the task description
      </h1>
      <div style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '50px' }}>
        <div>
          <>Primary Button Example:</>
          <br />
          {/* <Button variant='primary-filled'> */}
          <Button variant="filled" color="primary.0">
            Primary Button
          </Button>
          <br />
          <></>
          <br />

          <Button variant="outline" color="primary.1">
            Primary Button
          </Button>
          <br />
          <></>
          <br />
          <Button variant="outline" color="primary.0" disabled>
            Primary Button
          </Button>
          <br />
          <></>
          <br />
          <Button variant="outline" color="primary.0" loading>
            Primary Button
          </Button>
        </div>
        <br />
        <></>
        <br />
        <div>
          <>Secondary Button Example:</>
          <br />
          <Button variant="filled" color="secondary.0">
            {' '}
            Secondary Button
          </Button>
          <br />
          <></>
          <br />
          <Button variant="outline" color="secondary.0">
            {' '}
            Secondary Button
          </Button>
          <br />
          <></>
          <br />
          <Button color="secondary.0" disabled>
            {' '}
            Secondary Button
          </Button>
          <br />
          <></>
          <br />
          <Button variant="outline" color="secondary.0" loading>
            {' '}
            Secondary Button
          </Button>
          <br />
          <></>
        </div>

        <div>
          <>Success Button Example:</>
          <br />
          <Button variant="filled" color="success.0">
            Success Button
          </Button>
          <br />
          <></>
          <br />

          <Button variant="outline" color="success.0">
            Success Button
          </Button>
          <br />
          <></>
          <br />
          <Button variant="outline" color="success.0" disabled>
            Success Button
          </Button>
          <br />
          <></>
          <br />
          <Button variant="outline" color="success.0" loading>
            Success Button
          </Button>
        </div>
        <br />
        <></>
        <br />

        <div>
          <>Danger Button Example:</>
          <br />
          <Button variant="filled" color="danger.0">
            Danger Button
          </Button>
          <br />
          <></>
          <br />

          <Button variant="outline" color="danger.0">
            Danger Button
          </Button>
          <br />
          <></>
          <br />
          <Button variant="outline" color="danger.0" disabled>
            Danger Button
          </Button>
          <br />
          <></>
          <br />
          <Button variant="outline" color="danger.0" loading>
            Danger Button
          </Button>
        </div>
        <br />
        <></>
        <br />
        <div>
          <>Warning Button Example:</>
          <br />
          <Button variant="filled" color="warning.0">
            Warning Button
          </Button>
          <br />
          <></>
          <br />

          <Button variant="outline" color="warning.0">
            Warning Button
          </Button>
          <br />
          <></>
          <br />
          <Button variant="outline" color="warning.0" disabled>
            Warning Button
          </Button>
          <br />
          <></>
          <br />
          <Button variant="outline" color="warning.0" loading>
            Warning Button
          </Button>
        </div>
        <br />
        <></>
        <br />
        <div>
          <>Info Button Example:</>
          <br />
          <Button variant="filled" color="info.0">
            Info Button
          </Button>
          <br />
          <></>
          <br />

          <Button variant="outline" color="info.0">
            Info Button
          </Button>
          <br />
          <></>
          <br />
          <Button variant="outline" color="info.0" disabled>
            Info Button
          </Button>
          <br />
          <></>
          <br />
          <Button variant="outline" color="info.0" loading>
            Info Button
          </Button>
        </div>
        <br />
        <></>
        <br />
        <div>
          <>Different Sizes of Buttons Examples:</>
          <br />

          <Button variant="outline" color="primary.1" size="xl">
            XL Button
          </Button>
          <br />
          <></>
          <br />
          <Button variant="outline" disabled size="lg">
            LG Button
          </Button>
          <br />
          <></>
          <br />
          <Button variant="primary-filled" size="md">
            MD Button
          </Button>
          <br />
          <></>
          <br />

          <Button variant="outline" color="primary.1" size="sm">
            SM Button
          </Button>
          <br />
          <></>
          <br />
          <Button variant="outline" disabled size="xs">
            XS Button
          </Button>
          <br />
          <></>
          <br />
        </div>
        <br />
        <></>
        <br />
      </div>
    </MantineProvider>
  );
};

export default ButtonsPage;
