import { Checkbox, Label } from '@rebass/forms';
import React from 'react';
import { FieldRenderProps } from 'react-final-form';

type Props = FieldRenderProps<boolean, any>;

const CheckboxInput: React.FC<Props> = ({ input: { value, ...input } }: Props) => (
  <Label width={[1 / 2, 1 / 4]} my="auto" p={2} justifyContent="flex-end">
    <Checkbox {...input} type="checkbox" checked={!!value} />
  </Label>
);

export default CheckboxInput;
