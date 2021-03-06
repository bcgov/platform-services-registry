import { Label, Textarea } from '@rebass/forms';
import React from 'react';
import { FieldRenderProps } from 'react-final-form';

type Props = FieldRenderProps<string, any>;

const TextAreaInput: React.FC<Props> = ({
  input,
  meta: { active, error, touched },
  ...rest
}: Props) => (
  <div className={active ? 'active' : ''}>
    <Textarea {...input} {...rest} />
    {error && touched && (
      <Label as="span" variant="errorLabel">
        {error}
      </Label>
    )}
  </div>
);

export default TextAreaInput;
