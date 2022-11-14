//
// Copyright © 2020 Province of British Columbia
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';
import { Label } from '@rebass/forms';
import React, { useEffect, useState } from 'react';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { connect } from 'react-redux';
import { Box, Flex } from 'rebass';
import { MAXIMUM_TECHNICAL_LEADS, MINIMUM_TECHNICAL_LEADS, ROLES } from '../../constants';
import Aux from '../../hoc/auxillary';
import githubIDSearchKeyword from '../../redux/githubID/githubID.action';
import { GithubIdBaseInterface } from '../../redux/githubID/githubID.reducer';
import { selectProductOwner, selectTechnicalLead } from '../../redux/githubID/githubID.selector';
import getValidator from '../../utils/getValidator';
import { Button, SquareFormButton } from '../common/UI/Button';
import FormSubtitle from '../common/UI/FormSubtitle';
import FormTitle from '../common/UI/FormTitle';
import GithubUserValidation from '../common/UI/GithubUserValidation/GithubUserValidation';
import TextInput from '../common/UI/TextInput';

interface ContactInterface {
  instance: IPublicClientApplication;
  accounts: AccountInfo[];
  graphToken: string;
  selectedTechnicalLeads: GithubIdBaseInterface;
  position: number;
}

const CreateFormTL: React.FC<ContactInterface> = (props) => {
  const {
    instance,
    accounts,
    graphToken,
    selectedTechnicalLeads,
    position,
  } = props;
  const validator = getValidator();
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  console.log(`${JSON.stringify(selectedTechnicalLeads)}`);
  useEffect(() => {
    mapDispatchToProps({ selectedTechnicalLeads });
    console.log(`selected Technical Leads: ${JSON.stringify(selectedTechnicalLeads)}`);
  }, [selectedTechnicalLeads]);

  return (
    <Aux>
      <FormTitle>Who is the technical lead for this product?</FormTitle>
      <FormSubtitle>
        Tell us about the Technical Lead (TL). This is typically the DevOps specialist; we will use
        this information to contact them with technical questions or notify them about platform
        events. You can list up to 2 Technical Leads.
      </FormSubtitle>
      <FieldArray name="technicalLeads" initialValue={[{}]}>
        {({ fields }) => (
          <div>
            {fields.map((name, index) => (
              <div key={name}>
                <Flex flexDirection="row">
                  <FormTitle style={{ margin: '14px 0 5px 0' }}>
                    Technical Lead {index === 0 ? '(Primary)' : '(Secondary)'}
                  </FormTitle>
                  {fields.length! > MINIMUM_TECHNICAL_LEADS && (
                    <Box my="auto" ml="auto" className="buttons">
                      <SquareFormButton
                        type="button"
                        onClick={() => fields.remove(index)}
                        style={{ cursor: 'pointer' }}
                        inversed
                      >
                        X
                      </SquareFormButton>
                    </Box>
                  )}
                </Flex>
                <Field name={`${name}.roleId`} initialValue={ROLES.TECHNICAL_LEAD}>
                  {({ input }) => <input type="hidden" {...input} id={`${name}.roleId`} />}
                </Field>
                <Flex flexDirection="column">
                  <Label htmlFor={`${name}.githubId`}>Search contact by their IDIR email address</Label>
                  <GithubUserValidation
                    name={`${name}.githubId`}
                    defaultValue=""
                    initialValue=""
                    persona="technicalLeads"
                    position={index}
                    instance={instance}
                    accounts={accounts}
                    graphToken={graphToken}
                  />
                </Flex>
                {/* <Flex flexDirection="column">
                  <Label htmlFor={`${name}.firstName`}>First Name</Label>
                  <Field<string>
                    name={`${name}.firstName`}
                    component={TextInput}
                    validate={validator.mustBeValidName}
                    placeholder="Jane"
                  />
                </Flex> */}
                <Flex flexDirection="column">
                  <Label htmlFor={`${name}.firstName`}>First Name</Label>
                  <Field<string>
                    name={`${name}.firstName`}
                    defaultValue=""
                    initialValue=""
                  >
                    {({ input }) => <input type="text" value={`${firstName}`} readOnly={true} />}
                  </Field>
                </Flex>
                {/* <Flex flexDirection="column">
                  <Label htmlFor={`${name}.lastName`}>Last Name</Label>
                  <Field<string>
                    name={`${name}.lastName`}
                    component={TextInput}
                    validate={validator.mustBeValidName}
                    placeholder="Doe"
                  />
                </Flex> */}
                <Flex flexDirection="column">
                  <Label htmlFor={`${name}.email`}>Email Address</Label>
                  {/* <Field<string>
                    name={`${name}.email`}
                    component={TextInput}
                    validate={validator.mustBeValidEmail}
                    placeholder="jane.doe@example.com"
                    sx={{ textTransform: 'none' }}
                  /> */}
                  {/* <GithubUserValidation
                    name={`${name}.email`}
                    defaultValue=""
                    initialValue=""
                    placeholder="jane.doe@example.com"
                    persona="technicalLeads"
                    position={index}
                    instance={instance}
                    accounts={accounts}
                    graphToken={graphToken}
                  /> */}
                </Flex>
                {/* <Flex flexDirection="column">
                  <Label htmlFor={`${name}.githubId`}>Idir Id</Label>
                  <GithubUserValidation
                    name={`${name}.githubId`}
                    defaultValue=""
                    initialValue=""
                    persona="technicalLeads"
                    position={index}
                    instance={instance}
                    accounts={accounts}
                    graphToken={graphToken}
                  />
                </Flex> */}
              </div>
            ))}
            {fields.length! < MAXIMUM_TECHNICAL_LEADS ? (
              <Button
                type="button"
                onClick={() =>
                  fields.push({ firstName: '', lastName: '', email: '', githubId: '' })
                }
              >
                Add Technical Lead
              </Button>
            ) : (
              ''
            )}
          </div>
        )}
      </FieldArray>
    </Aux>
  );
};

const mapStateToProps = (state: any, githubID: any) => ({
  selectedTechnicalLeads: selectTechnicalLead(githubID.position)(state),
});
const mapDispatchToProps = (dispatch: any) => ({
  dispatchSearchGithubIDInput: (payload: {
    persona: string;
    inputValue: string;
    position: number;
  }) => dispatch(githubIDSearchKeyword(payload)),
});
export default connect(mapStateToProps, mapDispatchToProps)(CreateFormTL);
