'use client';

import { Button, Select, Textarea } from '@mantine/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { failure, success } from '@/components/notification';
import { shortMonthLabel } from '@/components/public-cloud/forecast/forecast-grid-utils';
import { createProductVarianceNote, getProductFinanceDetail } from '@/services/backend/public-cloud/finance';

const FOIPPA_REMINDER =
  'Freedom of Information and Protection of Privacy Act: variance notes are free text and may be disclosable. Author and timestamp are stored on every note. Notes are never hard-deleted and are excluded from exports.';

export default function ProductVarianceNotes({
  licencePlate,
  canEdit,
}: Readonly<{ licencePlate: string; canEdit: boolean }>) {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ['product-finance', licencePlate],
    queryFn: () => getProductFinanceDetail(licencePlate),
    enabled: Boolean(licencePlate),
  });

  const monthOptions = useMemo(() => {
    const now = new Date();
    const options: Array<{ value: string; label: string }> = [];
    for (let i = 0; i < 12; i += 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      options.push({
        value: `${year}-${month}`,
        label: shortMonthLabel(year, month),
      });
    }
    return options;
  }, []);

  const [monthKey, setMonthKey] = useState(monthOptions[0]?.value ?? '');
  const [body, setBody] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const [year, month] = monthKey.split('-').map(Number);
      return createProductVarianceNote(licencePlate, { year, month, body });
    },
    onSuccess: async () => {
      success({ message: 'Variance note saved' });
      setBody('');
      setAcknowledged(false);
      await queryClient.invalidateQueries({ queryKey: ['product-finance', licencePlate] });
    },
    onError: () => failure({ message: 'Unable to save variance note' }),
  });

  const notes = data?.varianceNotes ?? [];

  return (
    <section
      className="border border-gray-200 rounded-lg bg-white p-4 space-y-4"
      aria-labelledby="variance-notes-heading"
    >
      <h3 id="variance-notes-heading" className="text-base font-semibold text-gray-900">
        Variance notes
      </h3>

      {canEdit && (
        <div className="space-y-3">
          <div role="note" className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            {FOIPPA_REMINDER}
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.currentTarget.checked)}
            />
            <span>I have read the Freedom of Information and Protection of Privacy Act reminder above.</span>
          </label>
          <Select
            label="Month"
            data={monthOptions}
            value={monthKey}
            onChange={(v) => setMonthKey(v || monthOptions[0]?.value || '')}
          />
          <Textarea
            label="Note"
            minRows={3}
            value={body}
            onChange={(e) => setBody(e.currentTarget.value)}
            disabled={!acknowledged}
          />
          <Button
            size="sm"
            disabled={!acknowledged || !body.trim()}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Add variance note
          </Button>
        </div>
      )}

      <ul className="space-y-3">
        {notes.length === 0 && <li className="text-sm text-gray-500">No variance notes yet.</li>}
        {notes.map(
          (note: {
            id: string;
            year: number;
            month: number;
            body: string;
            authorIdir: string;
            createdAt: string;
            supersedesNoteId: string | null;
          }) => (
            <li key={note.id} className="rounded border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
              <div className="text-xs text-gray-500 mb-1">
                {shortMonthLabel(note.year, note.month)} · {note.authorIdir} ·{' '}
                {new Date(note.createdAt).toLocaleString('en-CA')}
                {note.supersedesNoteId ? ' · edit of prior note' : ''}
              </div>
              <div className="whitespace-pre-wrap">{note.body}</div>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
