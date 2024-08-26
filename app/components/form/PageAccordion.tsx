'use client';

import { Accordion, Button } from '@mantine/core';
import _kebabCase from 'lodash-es/kebabCase';
import { useEffect, useState } from 'react';
import { AccordionLabel, AccordionLabelProps } from '@/components/generic/AccordionLabel';

export type PageAccordionItem = AccordionLabelProps & {
  id?: string;
  Component: React.FC<any>;
  componentArgs: any;
};

function InnerPageAccordion({ items }: { items: (PageAccordionItem & { id: string })[] }) {
  const [selected, setSelected] = useState([items[0].id]);

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
  return <InnerPageAccordion items={items.map((item) => ({ ...item, id: item.id ?? _kebabCase(item.label) }))} />;
}
