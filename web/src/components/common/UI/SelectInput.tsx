import { Label, Select } from '@rebass/forms';
import React from 'react';
import { FieldRenderProps } from 'react-final-form';

type Props = FieldRenderProps<string, any>;

const SelectInput: React.FC<Props> = ({
  input,
  meta: { active, error, touched },
  ...rest
}: Props) => (
  <div className={active ? 'active' : ''} style={{ flex: 1 }}>
    <Select {...input} {...rest} />
    {error && touched && (
      <Label as="span" variant="errorLabel">
        {error}
      </Label>
    )}
  </div>
);

export default SelectInput;
