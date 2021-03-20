import { Label } from '@rebass/forms';
import React from 'react';
import { Field } from 'react-final-form';
import { Flex } from 'rebass';
import Aux from '../../../hoc/auxillary';
import getValidator from '../../../utils/getValidator';
import FormTitle from './FormTitle';
import TextInput from './TextInput';


interface AddFormTCProps {
    count: number;
}

export const AddFormTC: React.FC<AddFormTCProps> = (props: any) => {
    const { count } = props;
    const validator = getValidator();
    const tc_firstName: string = `tc-firstName-${count}`;
    const tc_lastName: string = `tc-lastName-${count}`;
    const tc_email: string = `tc-email-${count}`;
    const tc_githubId: string = `tc-githubId-${count}`;

    return (
        <Aux>
            <br />
            <FormTitle>Technical Contact {count + 1}</FormTitle>
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
