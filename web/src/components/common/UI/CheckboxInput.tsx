import { Checkbox, Label } from '@rebass/forms';
import { Box } from 'rebass';
import React from 'react';
import { FieldRenderProps } from 'react-final-form';

type Props = FieldRenderProps<boolean, any>;

const CheckboxInput: React.FC<Props> = ({
  input: { value, type, ...input },
  meta: { error, touched },
}: Props) => (
  <Box>
    <Label m="auto" px={2} justifyContent="flex-end">
      <Checkbox type="checkbox" checked={!!value} {...input} />
    </Label>
    {error && touched && (
      <Label as="span" variant="errorLabel" sx={{ padding: 0, margin: 0 }}>
        {error}
      </Label>
    )}
  </Box>
);

export default CheckboxInput;
