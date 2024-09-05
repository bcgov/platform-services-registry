'use client';

import { Accordion, Button } from '@mantine/core';
import _kebabCase from 'lodash-es/kebabCase';
import { useEffect, useState } from 'react';
import { AccordionLabel, AccordionLabelProps } from '@/components/generic/AccordionLabel';

export type PageAccordionItem = AccordionLabelProps & {
  id?: string;
  initialOpen?: boolean;
  Component: React.FC<any>;
  componentArgs: any;
};

function InnerPageAccordion({
  items,
  initialSelected,
}: {
  items: (PageAccordionItem & { id: string })[];
  initialSelected: string[];
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
      <div className="mb-2">
        <Button color="secondary" className="mr-2" onClick={() => setSelected(allKeys)}>
          Expand all
        </Button>
        <Button color="secondary" onClick={() => setSelected([])}>
          Collapse all
        </Button>
      </div>
      <Accordion chevronPosition="right" variant="contained" multiple value={selected} onChange={setSelected}>
        {accordionItems}
      </Accordion>
    </>
  );
}

export default function PageAccordion({ items }: { items: PageAccordionItem[] }) {
  const _items = items.map((item) => ({ ...item, id: item.id ?? _kebabCase(item.label) }));
  const initialSelected = _items.filter((item) => item.initialOpen);
  const selected = initialSelected.length > 0 ? initialSelected.map((item) => item.id) : [_items[0].id];
  return <InnerPageAccordion items={_items} initialSelected={selected} />;
}
