'use client';

import { Accordion, Button } from '@mantine/core';
import _kebabCase from 'lodash-es/kebabCase';
import { useEffect, useState } from 'react';
import { AccordionLabel, AccordionLabelProps } from '@/components/generic/accordion/AccordionLabel';

export type PageAccordionItem = AccordionLabelProps & {
  id?: string;
  initialOpen?: boolean;
  Component: React.FC<any>;
  componentArgs: any;
};

function InnerPageAccordion({
  items,
  initialSelected,
  showToggles = true,
}: {
  items: (PageAccordionItem & { id: string })[];
  initialSelected: string[];
  showToggles?: boolean;
}) {
  const [selected, setSelected] = useState(initialSelected);

  const accordionItems = items.map((item) => (
    <Accordion.Item value={item.id ?? ''} key={item.label}>
      <Accordion.Control>
        <AccordionLabel {...item} />
      </Accordion.Control>
      <Accordion.Panel className="bg-white">
        <item.Component {...item.componentArgs} />
      </Accordion.Panel>
    </Accordion.Item>
  ));

  const allKeys = items.map((v) => v.id);
  return (
    <>
      {showToggles && (
        <div className="mb-2">
          <Button color="secondary" className="mr-2" onClick={() => setSelected(allKeys)}>
            Expand all
          </Button>
          <Button color="secondary" onClick={() => setSelected([])}>
            Collapse all
          </Button>
        </div>
      )}

      <Accordion chevronPosition="right" variant="contained" multiple value={selected} onChange={setSelected}>
        {accordionItems}
      </Accordion>
    </>
  );
}

export default function PageAccordion({
  items,
  showToggles = true,
  initialSelected,
}: {
  items: PageAccordionItem[];
  initialSelected?: string[];
  showToggles?: boolean;
}) {
  if (items.length === 0) return null;

  const _items = items.map((item) => ({ ...item, id: item.id ?? _kebabCase(item.label) }));
  const _initialSelected = _items.filter((item) => item.initialOpen);
  const selected = _initialSelected.length > 0 ? _initialSelected.map((item) => item.id) : [_items[0].id];
  return <InnerPageAccordion items={_items} initialSelected={initialSelected ?? selected} showToggles={showToggles} />;
}
