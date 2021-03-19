import { Label } from '@rebass/forms';
import React from 'react';
import { Field } from 'react-final-form';
import { Flex } from 'rebass';
import Aux from '../../../hoc/auxillary';
import getValidator from '../../../utils/getValidator';
import FormSubtitle from './FormSubtitle';
import FormTitle from './FormTitle';
import TextInput from './TextInput';

interface FormTCProps {
    count: number;
}

export const FormTC: React.FC<AddFormTCProps> = (props) => {
    const { count } = props
    const validator = getValidator();
    console.log(count)
    return (
        <Aux>
            <FormTitle>Who is the technical contact for this project?</FormTitle>
            <FormSubtitle>
                Tell us about the Technical Contact (TC). This is typically the DevOps specialist; we will
                use this information to contact them with technical questions or notify them about platform
                events. You can list up to 3 Technical Contacts.
            </FormSubtitle>
            <FormTitle>Technical Contact 1</FormTitle>
            <Flex flexDirection="column">
                <Label htmlFor="tc-firstName1">First Name</Label>
                <Field<string>
                    name="tc-firstName1"
                    component={TextInput}
                    validate={validator.mustBeValidName}
                    placeholder="Jane"
                />
            </Flex>
            <Flex flexDirection="column">
                <Label htmlFor="tc-lastName1">Last Name</Label>
                <Field<string>
                    name="tc-lastName1"
                    component={TextInput}
                    validate={validator.mustBeValidName}
                    placeholder="Doe"
                />
            </Flex>
            <Flex flexDirection="column">
                <Label htmlFor="tc-email1">Email Address</Label>
                <Field<string>
                    name="tc-email1"
                    component={TextInput}
                    validate={validator.mustBeValidEmail}
                    placeholder="jane.doe@example.com"
                />
            </Flex>
            <Flex flexDirection="column">
                <Label htmlFor="tc-githubId1">GitHub Id</Label>
                <Field<string>
                    name="tc-githubId1"
                    component={TextInput}
                    validate={validator.mustBeValidGithubName}
                    placeholder="jane1100"
                />
            </Flex>
            <Field<number> name='tc-count' component='input' value={count} />
        </Aux>
    )
};

interface AddFormTCProps {
    count: number;
}

export const AddFormTC: React.FC<AddFormTCProps> = (props: any) => {
    const { count } = props
    const validator = getValidator();
    const tc_firstName: string = `tc-firstName${count}`;
    const tc_lastName: string = `tc-lastName${count}`;
    const tc_email: string = `tc-email${count}`;
    const tc_githubId: string = `tc-githubId${count}`;

    return (

        <Aux>
            <br />
            <FormTitle>Technical Contact {count}</FormTitle>
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
