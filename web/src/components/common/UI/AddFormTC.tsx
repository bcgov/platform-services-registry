import { Label } from '@rebass/forms';
import React from 'react';
import { Field } from 'react-final-form';
import { Flex } from 'rebass';
import { ROLES } from '../../../constants';
import Aux from '../../../hoc/auxillary';
import getValidator from '../../../utils/getValidator';
import TextInput from './TextInput';

interface AddFormTCProps {
    count: number;
}

export const AddFormTC: React.FC<AddFormTCProps> = (props: any) => {
    const { count } = props;
    const validator = getValidator();
    const tc_role: string = `technicalContact.tl-${count}.role`
    const tc_firstName: string = `technicalContact.tl-${count}.firstName`;
    const tc_lastName: string = `technicalContact.tl-${count}.lastName`;
    const tc_email: string = `technicalContact.tl-${count}.email`;
    const tc_githubId: string = `technicalContact.tl-${count}.githubId`;

    return (
        <Aux>
            <Field name={tc_role} initialValue={ROLES.TECHNICAL_LEAD}>
                {({ input }) => <input type="hidden" {...input} id="role" />}
            </Field>
            <Flex flexDirection="column">
                <Label htmlFor={tc_firstName}>First Name</Label>
                <Field<string>
                    name={tc_firstName}
                    component={TextInput}
                    validate={validator.mustBeValidName}
                    placeholder="Jane"
                />
            </Flex>
            <Flex flexDirection="column">
                <Label htmlFor={tc_lastName}>Last Name</Label>
                <Field<string>
                    name={tc_lastName}
                    component={TextInput}
                    validate={validator.mustBeValidName}
                    placeholder="Doe"
                />
            </Flex>
            <Flex flexDirection="column">
                <Label htmlFor={tc_email}>Email Address</Label>
                <Field<string>
                    name={tc_email}
                    component={TextInput}
                    validate={validator.mustBeValidEmail}
                    placeholder="jane.doe@example.com"
                />
            </Flex>
            <Flex flexDirection="column">
                <Label htmlFor={tc_githubId}>GitHub Id</Label>
                <Field<string>
                    name={tc_githubId}
                    component={TextInput}
                    validate={validator.mustBeValidGithubName}
                    placeholder="jane1100"
                />
            </Flex>
        </Aux>
    )
};
