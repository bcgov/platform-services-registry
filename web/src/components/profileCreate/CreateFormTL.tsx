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
import { githubIDSearchKeyword } from '../../redux/githubID/githubID.action';
import { GithubIdBaseInterface } from '../../redux/githubID/githubID.reducer';
import { selectTechnicalLead } from '../../redux/githubID/githubID.selector';
import { Button, SquareFormButton } from '../common/UI/Button';
import FormSubtitle from '../common/UI/FormSubtitle';
import FormTitle from '../common/UI/FormTitle';
import GithubUserValidation from '../common/UI/GithubUserValidation/GithubUserValidation';
import TextInput from '../common/UI/TextInput';

interface ContactInterface {
  instance: IPublicClientApplication;
  accounts: AccountInfo[];
  graphToken: string;
  selectedTechnicalLeads1: GithubIdBaseInterface;
  selectedTechnicalLeads2: GithubIdBaseInterface;
}

const CreateFormTL: React.FC<ContactInterface> = (props) => {
  const {
    instance,
    accounts,
    graphToken,
    selectedTechnicalLeads1,
    selectedTechnicalLeads2,
  } = props;
  const [firstName1, setFirstName1] = useState<string>('');
  const [lastName1, setLastName1] = useState<string>('');
  const [email1, setEmail1] = useState<string>('');
  const [firstName2, setFirstName2] = useState<string>('');
  const [lastName2, setLastName2] = useState<string>('');
  const [email2, setEmail2] = useState<string>('');

  useEffect(() => {
    mapDispatchToProps({ selectedTechnicalLeads1 });
    setFirstName1(
      selectedTechnicalLeads1.githubUser
        ? selectedTechnicalLeads1.githubUser.value[0].givenName
        : '',
    );
    setLastName1(
      selectedTechnicalLeads1.githubUser ? selectedTechnicalLeads1.githubUser.value[0].surname : '',
    );
    setEmail1(
      selectedTechnicalLeads1.githubUser ? selectedTechnicalLeads1.githubUser.value[0].mail : '',
    );

    mapDispatchToProps({ selectedTechnicalLeads2 });
    setFirstName2(
      selectedTechnicalLeads2.githubUser
        ? selectedTechnicalLeads2.githubUser.value[0].givenName
        : '',
    );
    setLastName2(
      selectedTechnicalLeads2.githubUser ? selectedTechnicalLeads2.githubUser.value[0].surname : '',
    );
    setEmail2(
      selectedTechnicalLeads2.githubUser ? selectedTechnicalLeads2.githubUser.value[0].mail : '',
    );
  }, [selectedTechnicalLeads1, selectedTechnicalLeads2]);

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
                  <Label htmlFor={`${name}.githubId`}>
                    Search contact by their IDIR email address
                  </Label>
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
                <Flex flexDirection="column">
                  <Label htmlFor={`${name}.firstName`}>First Name</Label>
                  <Field<string> name={`${name}.firstName`} defaultValue="" initialValue="">
                    {({ input }) => (
                      <input
                        type="text"
                        value={index === 0 ? `${firstName1}` : `${firstName2}`}
                        readOnly={true}
                      />
                    )}
                  </Field>
                </Flex>
                <Flex flexDirection="column">
                  <Label htmlFor={`${name}.lastName`}>Last Name</Label>
                  <Field<string> name={`${name}.lastName`} placeholder="Doe">
                    {({ input }) => (
                      <input
                        type="text"
                        value={index === 0 ? `${lastName1}` : `${lastName2}`}
                        readOnly={true}
                      />
                    )}
                  </Field>
                </Flex>
                <Flex flexDirection="column">
                  <Label htmlFor={`${name}.email`}>Email Address</Label>
                  <Field<string>
                    name={`${name}.email`}
                    component={TextInput}
                    placeholder="jane.doe@example.com"
                    sx={{ textTransform: 'none' }}
                  >
                    {({ input }) => (
                      <input
                        type="text"
                        value={index === 0 ? `${email1}` : `${email2}`}
                        readOnly={true}
                      />
                    )}
                  </Field>
                </Flex>
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
  selectedTechnicalLeads1: selectTechnicalLead(0)(state),
  selectedTechnicalLeads2: selectTechnicalLead(1)(state),
});
const mapDispatchToProps = (dispatch: any) => ({
  dispatchSearchGithubIDInput: (payload: {
    persona: string;
    inputValue: string;
    position: number;
  }) => dispatch(githubIDSearchKeyword(payload)),
});
export default connect(mapStateToProps, mapDispatchToProps)(CreateFormTL);
