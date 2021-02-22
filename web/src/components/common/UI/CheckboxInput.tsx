import { Checkbox, Label } from '@rebass/forms';
import React from 'react';
import { FieldRenderProps } from 'react-final-form';

type Props = FieldRenderProps<boolean, any>;

const CheckboxInput: React.FC<Props> = ({
  input: { value, type, ...input },
  meta: { error, touched },
}: Props) => (
  <Label my="auto" p={2} justifyContent="flex-end">
    <Checkbox type="checkbox" checked={!!value} {...input} />
    {error && touched && (
      <Label as="span" variant="errorLabel">
        {error}
      </Label>
    )}
  </Label>
);

export default CheckboxInput;
