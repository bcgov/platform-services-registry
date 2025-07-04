import { Badge, Table } from '@mantine/core';
import { IconArrowNarrowDownDashed } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import _get from 'lodash-es/get';
import _startCase from 'lodash-es/startCase';
import { useSession } from 'next-auth/react';
import { Fragment, useState } from 'react';
import FormSingleSelect from '@/components/generic/select/FormSingleSelect';
import { namespaceKeys, resourceKeys } from '@/constants';
import { ResourceRequestsEnv } from '@/prisma/client';
import { getCurrentPrivateCloudUnitPrice } from '@/services/backend/private-cloud/unit-prices';
import { cn, formatCurrency, isLeapYear } from '@/utils/js';

function Estimation({ value, price, unit, diff = 0 }: { value: number; price: number; unit: string; diff?: number }) {
  const increased = diff > 0;
  const decreased = diff < 0;

  return (
    <div>
      <span className={cn('mr-2 text-gray-900', { 'text-red-600': increased }, { 'text-blue-600': decreased })}>
        {formatCurrency(price)}
      </span>
      <span className={cn('text-xs text-gray-600', { 'text-red-400': increased }, { 'text-blue-500': decreased })}>
        ({value}
        {unit})
      </span>
    </div>
  );
}

function CpuEstimation(props: { value: number; price: number; diff?: number }) {
  return <Estimation {...props} unit="Core" />;
}

function StorageEstimation(props: { value: number; price: number; diff?: number }) {
  return <Estimation {...props} unit="GiB" />;
}

function EstimationTotal({ price, diff = 0 }: { price: number; diff?: number }) {
  const increased = diff > 0;
  const decreased = diff < 0;

  return (
    <div className={cn('mr-2 text-gray-900', { 'text-red-600': increased }, { 'text-blue-600': decreased })}>
      {formatCurrency(price)}
    </div>
  );
}

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

function EnvDetails({
  envData,
  division = 1,
  isTotal = false,
}: {
  envData: EnvironmentMetadata;
  division?: number;
  isTotal?: boolean;
}) {
  const totalDiff = envData.subtotal.changed ? envData.subtotal.new.price - envData.subtotal.old.price : 0;
  const increased = totalDiff > 0;
  const decreased = totalDiff < 0;

  let summary = envData.subtotal.changed ? (
    <div className={cn('text-right text-gray-700 italic')}>No changes</div>
  ) : (
    <></>
  );

  if (increased) {
    summary = (
      <div className={cn('text-right text-red-600 italic')}>
        <span className="mr-1">{formatCurrency(Math.abs(totalDiff / division))}</span>
        <span>increased</span>
      </div>
    );
  } else if (decreased) {
    summary = (
      <div className={cn('text-right text-blue-600 italic')}>
        <span className="mr-1">{formatCurrency(Math.abs(totalDiff / division))}</span>
        <span>decreased</span>
      </div>
    );
  }

  return (
    <>
      <Table highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th className="text-center text-sm px-1">CPU</Table.Th>
            <Table.Th className="text-center text-sm px-1">Storage</Table.Th>
            <Table.Th className="text-center text-sm px-1">{isTotal ? 'Grand Total' : 'Subtotal'}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td className="text-center px-1 align-top">
              {envData.cpu.changed && (
                <>
                  <CpuEstimation value={envData.cpu.old.value} price={envData.cpu.old.price / division} />
                  <IconArrowNarrowDownDashed className="block mx-auto" />
                </>
              )}
              <CpuEstimation
                value={envData.cpu.new.value}
                price={envData.cpu.new.price / division}
                diff={envData.cpu.changed ? envData.cpu.new.price - envData.cpu.old.price : 0}
              />
            </Table.Td>
            <Table.Td className="text-center px-1 align-top">
              {envData.storage.changed && (
                <>
                  <StorageEstimation value={envData.storage.old.value} price={envData.storage.old.price / division} />
                  <IconArrowNarrowDownDashed className="block mx-auto" />
                </>
              )}
              <StorageEstimation
                value={envData.storage.new.value}
                price={envData.storage.new.price / division}
                diff={envData.storage.changed ? envData.storage.new.price - envData.storage.old.price : 0}
              />
            </Table.Td>
            <Table.Td className="text-center px-1 align-top">
              {envData.subtotal.changed && (
                <>
                  <EstimationTotal price={envData.subtotal.old.price / division} />
                  <IconArrowNarrowDownDashed className="block mx-auto" />
                </>
              )}
              <EstimationTotal price={envData.subtotal.new.price / division} diff={totalDiff} />
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
      {summary}
    </>
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
    { label: 'Daily', division: leapYear ? 366 : 365, leapYear },
    { label: 'Monthly', division: 12 },
    { label: 'Quarterly', division: 4 },
    { label: 'Yearly', division: 1 },
  ];

  const currentScenario = scenarios.find((s) => s.label.toLowerCase() === period.toLowerCase());
  if (!currentScenario) {
    return null;
  }

  const scenarioDetail = (
    <Fragment>
      <Table.Tr className="border-t-2 border-t-gray-800">
        <Table.Td colSpan={5}>
          <span className="font-bold mr-1">{currentScenario.label}</span>
          {currentScenario.leapYear && (
            <Badge size="sm" className="mr-3">
              Leap year
            </Badge>
          )}
          <span className="text-sm italic text-gray-600">
            {formatCurrency(unitPriceCpu / currentScenario.division)} per CPU Core /{' '}
            {formatCurrency(unitPriceStorage / currentScenario.division)} per Storage GiB
          </span>
        </Table.Td>
      </Table.Tr>
      <Table.Tr>
        {namespaceKeys.map((namespace) => {
          return (
            <Table.Td key={namespace} className="align-top px-1">
              <EnvDetails envData={metadata[namespace]} division={currentScenario.division} />
            </Table.Td>
          );
        })}
        <Table.Td className="align-top px-1">
          <EnvDetails envData={metadata.total} division={currentScenario.division} isTotal />
        </Table.Td>
      </Table.Tr>
    </Fragment>
  );

  return (
    <>
      <div className="font-bold text-lg flex justify-between mb-1">
        <span>Cost Estimation</span>
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
          />
        </div>
      </div>
      <Table.ScrollContainer minWidth={500}>
        <Table highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              {namespaceKeys.map((namespace) => (
                <Table.Th key={namespace} className="text-center">
                  {_startCase(namespace)}
                </Table.Th>
              ))}
              <Table.Th className="text-center">Total</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody className="border-b-2 border-b-gray-800">{scenarioDetail}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </>
  );
}
