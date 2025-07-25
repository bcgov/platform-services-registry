import { IconArrowNarrowRight, IconCurrencyDollarCanadian } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import _get from 'lodash-es/get';
import _startCase from 'lodash-es/startCase';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import FormSingleSelect from '@/components/generic/select/FormSingleSelect';
import { namespaceKeys } from '@/constants';
import { ResourceRequestsEnv } from '@/prisma/client';
import { getCurrentPrivateCloudUnitPrice } from '@/services/backend/private-cloud/unit-prices';
import { cn, formatCurrency, isLeapYear } from '@/utils/js';

interface PriceData {
  value: number;
  price: number;
}

interface EnvironmentMetadata {
  cpu: { old: PriceData; new: PriceData; changed: boolean };
  storage: { old: PriceData; new: PriceData; changed: boolean };
  subtotal: { old: { price: number }; new: { price: number }; changed: boolean };
}

interface Metadata {
  development: EnvironmentMetadata;
  test: EnvironmentMetadata;
  production: EnvironmentMetadata;
  tools: EnvironmentMetadata;
  total: EnvironmentMetadata;
}

interface CellData {
  old: { price: number };
  new: { price: number };
  changed: boolean;
}

function HeaderCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex-1 p-2 bg-gray-100 border-gray-400 border-1', className)}>{children}</div>;
}

function LabelCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('w-32 p-2 font-semibold bg-gray-100 border-gray-400 border-1', className)}>{children}</div>;
}

function ValueChange({ data, division }: { data: CellData; division: number }) {
  return (
    <div className="text-gray-600">
      <span>{formatCurrency(data.old.price / division)}</span>
      {data.changed && (
        <>
          <IconArrowNarrowRight className="mx-1 inline-block" />
          <span className="font-bold text-black">{formatCurrency(data.new.price / division)}</span>
        </>
      )}
    </div>
  );
}

function ValueCell({ data, division, className }: { data: CellData; division: number; className?: string }) {
  return (
    <div
      className={cn('flex-1 p-2 flex items-center justify-center border-gray-400 border-1', className, {
        'border-blue-700 outline-dashed outline-offset-0 outline-3 outline-blue-700': data.changed,
      })}
    >
      <ValueChange data={data} division={division} />
    </div>
  );
}

function SmallScreenEnv({
  name,
  data,
  division,
  className = '',
}: {
  name: string;
  division: number;
  data: { cpu: CellData; storage: CellData; subtotal: CellData };
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      <div className="flex flex-row font-bold text-center">
        <HeaderCell>{name}</HeaderCell>
      </div>

      <div className="flex flex-row text-center">
        <LabelCell>CPU</LabelCell>
        <ValueCell data={data.cpu} division={division} />
      </div>

      <div className="flex flex-row text-center">
        <LabelCell>Storage</LabelCell>
        <ValueCell data={data.storage} division={division} />
      </div>

      <div className="flex flex-row text-center">
        <LabelCell className="bg-blue-200">Subtotal</LabelCell>
        <ValueCell
          className={cn(name === 'Total' ? 'bg-orange-100' : 'bg-blue-50')}
          data={data.subtotal}
          division={division}
        />
      </div>
    </div>
  );
}

const periodOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly', value: 'yearly' },
];

type Period = 'daily' | 'monthly' | 'quarterly' | 'yearly';

export default function QuotasBudgetEstimation({
  originalData,
  formData,
  isGoldDR,
  className,
}: {
  originalData?: ResourceRequestsEnv;
  formData: ResourceRequestsEnv;
  isGoldDR: boolean;
  className?: string;
}) {
  const { data: session } = useSession();
  const [period, setPeriod] = useState<Period>('monthly');

  const { data: currentUnitPrice, isLoading: isCurrentUnitPriceLoading } = useQuery({
    queryKey: ['currentUnitPrice'],
    queryFn: () => getCurrentPrivateCloudUnitPrice(),
  });

  if (!session?.previews.costRecovery || isCurrentUnitPriceLoading) return null;

  let unitPriceCpu = currentUnitPrice?.cpu ?? 0;
  let unitPriceStorage = currentUnitPrice?.storage ?? 0;

  if (isGoldDR) {
    unitPriceCpu *= 2;
    unitPriceStorage *= 2;
  }

  const metadata: Metadata = {
    development: {
      cpu: {
        old: { value: 0, price: 0 },
        new: { value: formData.development.cpu, price: formData.development.cpu * unitPriceCpu },
        changed: false,
      },
      storage: {
        old: { value: 0, price: 0 },
        new: { value: formData.development.storage, price: formData.development.storage * unitPriceStorage },
        changed: false,
      },
      subtotal: {
        old: { price: 0 },
        new: { price: 0 },
        changed: false,
      },
    },
    test: {
      cpu: {
        old: { value: 0, price: 0 },
        new: { value: formData.test.cpu, price: formData.test.cpu * unitPriceCpu },
        changed: false,
      },
      storage: {
        old: { value: 0, price: 0 },
        new: { value: formData.test.storage, price: formData.test.storage * unitPriceStorage },
        changed: false,
      },
      subtotal: {
        old: { price: 0 },
        new: { price: 0 },
        changed: false,
      },
    },
    production: {
      cpu: {
        old: { value: 0, price: 0 },
        new: { value: formData.production.cpu, price: formData.production.cpu * unitPriceCpu },
        changed: false,
      },
      storage: {
        old: { value: 0, price: 0 },
        new: { value: formData.production.storage, price: formData.production.storage * unitPriceStorage },
        changed: false,
      },
      subtotal: {
        old: { price: 0 },
        new: { price: 0 },
        changed: false,
      },
    },
    tools: {
      cpu: {
        old: { value: 0, price: 0 },
        new: { value: formData.tools.cpu, price: formData.tools.cpu * unitPriceCpu },
        changed: false,
      },
      storage: {
        old: { value: 0, price: 0 },
        new: { value: formData.tools.storage, price: formData.tools.storage * unitPriceStorage },
        changed: false,
      },
      subtotal: {
        old: { price: 0 },
        new: { price: 0 },
        changed: false,
      },
    },
    total: {
      cpu: {
        old: { value: 0, price: 0 },
        new: {
          value: formData.development.cpu + formData.test.cpu + formData.production.cpu + formData.tools.cpu,
          price: 0,
        },
        changed: false,
      },
      storage: {
        old: { value: 0, price: 0 },
        new: {
          value:
            formData.development.storage + formData.test.storage + formData.production.storage + formData.tools.storage,
          price: 0,
        },
        changed: false,
      },
      subtotal: {
        old: { price: 0 },
        new: { price: 0 },
        changed: false,
      },
    },
  };

  namespaceKeys.forEach((env) => {
    metadata[env].subtotal.new.price = metadata[env].cpu.new.price + metadata[env].storage.new.price;
  });

  metadata.total.cpu.new.price = metadata.total.cpu.new.value * unitPriceCpu;
  metadata.total.storage.new.price = metadata.total.storage.new.value * unitPriceStorage;
  metadata.total.subtotal.new.price = metadata.total.cpu.new.price + metadata.total.storage.new.price;

  if (originalData) {
    namespaceKeys.forEach((env) => {
      metadata[env].cpu.old.value = originalData[env].cpu;
      metadata[env].cpu.old.price = originalData[env].cpu * unitPriceCpu;
      metadata[env].cpu.changed = metadata[env].cpu.old.price !== metadata[env].cpu.new.price;

      metadata[env].storage.old.value = originalData[env].storage;
      metadata[env].storage.old.price = originalData[env].storage * unitPriceStorage;
      metadata[env].storage.changed = metadata[env].storage.old.price !== metadata[env].storage.new.price;

      metadata[env].subtotal.old.price = metadata[env].cpu.old.price + metadata[env].storage.old.price;
      metadata[env].subtotal.changed = metadata[env].subtotal.old.price !== metadata[env].subtotal.new.price;
    });

    metadata.total.cpu.old.value =
      originalData.development.cpu + originalData.test.cpu + originalData.production.cpu + originalData.tools.cpu;
    metadata.total.cpu.old.price = metadata.total.cpu.old.value * unitPriceCpu;
    metadata.total.cpu.changed = metadata.total.cpu.old.price !== metadata.total.cpu.new.price;

    metadata.total.storage.old.value =
      originalData.development.storage +
      originalData.test.storage +
      originalData.production.storage +
      originalData.tools.storage;
    metadata.total.storage.old.price = metadata.total.storage.old.value * unitPriceStorage;
    metadata.total.storage.changed = metadata.total.storage.old.price !== metadata.total.storage.new.price;

    metadata.total.subtotal.old.price = metadata.total.cpu.old.price + metadata.total.storage.old.price;
    metadata.total.subtotal.changed = metadata.total.subtotal.old.price !== metadata.total.subtotal.new.price;
  }

  const leapYear = isLeapYear();
  const scenarios = [
    { label: 'Daily', per: 'day', division: leapYear ? 366 : 365, leapYear },
    { label: 'Monthly', per: 'month', division: 12 },
    { label: 'Quarterly', per: 'quarter', division: 4 },
    { label: 'Yearly', per: 'year', division: 1 },
  ];

  const currentScenario = scenarios.find((s) => s.label.toLowerCase() === period.toLowerCase());
  if (!currentScenario) {
    return null;
  }

  return (
    <>
      <div className="font-bold text-lg flex justify-between mb-1">
        <span>Cost estimation</span>
        <div>
          <span className="mr-1 text-sm">Period:</span>
          <FormSingleSelect
            name="period"
            value={period}
            data={periodOptions}
            onChange={(value) => {
              if (value) {
                setPeriod(value as Period);
              }
            }}
            classNames={{ wrapper: 'inline-block' }}
            searchable={false}
          />
        </div>
      </div>
      <div>
        <div>
          All costs are in Canadian dollars.
          <img className="inline-block ml-1" src="/canada-flag.svg" alt="Canadian Flag" width={30} />
        </div>
        <div>
          Current projected total cost per {currentScenario.per}:
          <span className="font-normal ml-2">
            {formatCurrency(metadata.total.subtotal.old.price / currentScenario.division)}
          </span>
        </div>
        <div>
          New projected total cost per {currentScenario.per}:
          <span className="font-semibold ml-2">
            {formatCurrency(metadata.total.subtotal.new.price / currentScenario.division)}
          </span>
        </div>
      </div>
      <div className="mb-2">
        {/* --- Large Screen Layout --- */}
        <div className="mx-auto bg-white shadow-lg hidden sm:block">
          <div className="flex flex-row font-bold text-center">
            <div className="block w-32 p-2 bg-transparent"></div>

            <HeaderCell>Development</HeaderCell>
            <HeaderCell>Test</HeaderCell>
            <HeaderCell>Production</HeaderCell>
            <HeaderCell>Tools</HeaderCell>
            <HeaderCell className="bg-blue-200">Total</HeaderCell>
          </div>

          <div className="flex flex-row text-center">
            <LabelCell>CPU</LabelCell>
            <ValueCell data={metadata.development.cpu} division={currentScenario.division} />
            <ValueCell data={metadata.test.cpu} division={currentScenario.division} />
            <ValueCell data={metadata.production.cpu} division={currentScenario.division} />
            <ValueCell data={metadata.tools.cpu} division={currentScenario.division} />
            <ValueCell className="bg-blue-50" data={metadata.total.cpu} division={currentScenario.division} />
          </div>

          <div className="flex flex-row text-center">
            <LabelCell>Storage</LabelCell>
            <ValueCell data={metadata.development.storage} division={currentScenario.division} />
            <ValueCell data={metadata.test.storage} division={currentScenario.division} />
            <ValueCell data={metadata.production.storage} division={currentScenario.division} />
            <ValueCell data={metadata.tools.storage} division={currentScenario.division} />
            <ValueCell className="bg-blue-50" data={metadata.total.storage} division={currentScenario.division} />
          </div>

          <div className="flex flex-row text-center">
            <LabelCell className="bg-blue-200">Subtotal</LabelCell>
            <ValueCell
              className="bg-blue-50"
              data={metadata.development.subtotal}
              division={currentScenario.division}
            />
            <ValueCell className="bg-blue-50" data={metadata.test.subtotal} division={currentScenario.division} />
            <ValueCell className="bg-blue-50" data={metadata.production.subtotal} division={currentScenario.division} />
            <ValueCell className="bg-blue-50" data={metadata.tools.subtotal} division={currentScenario.division} />
            <ValueCell className="bg-orange-100" data={metadata.total.subtotal} division={currentScenario.division} />
          </div>
        </div>

        {/* --- Small Screen Layout --- */}
        <div className="container mx-auto block sm:hidden">
          <SmallScreenEnv name="Development" data={metadata.development} division={currentScenario.division} />
          <SmallScreenEnv name="Test" data={metadata.test} className="mt-2" division={currentScenario.division} />
          <SmallScreenEnv
            name="Production"
            data={metadata.production}
            className="mt-2"
            division={currentScenario.division}
          />
          <SmallScreenEnv name="Tools" data={metadata.tools} className="mt-2" division={currentScenario.division} />
          <SmallScreenEnv name="Total" data={metadata.total} className="mt-2" division={currentScenario.division} />
        </div>
      </div>
    </>
  );
}
