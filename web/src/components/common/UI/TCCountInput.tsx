import { Input } from '@rebass/forms';
import React from 'react';
import { FieldRenderProps } from 'react-final-form';

type Props = FieldRenderProps<number, any>;

const TCCountInput: React.FC<Props> = ({
    input,
    meta: { active, error, touched },
    ...rest
}: Props) => (
    <div>
        <Input {...input} {...rest} />
    </div>
);

export default TCCountInput;
