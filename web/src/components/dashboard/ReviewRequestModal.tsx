//
// Copyright © 2020 Province of British Columbia
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

import { Input, Label, Textarea } from '@rebass/forms';
import React from 'react';
import { Field, Form } from 'react-final-form';
import { Flex, Heading } from 'rebass';
import useCommonState from '../../hooks/useCommonState';
import useRegistryApi from '../../hooks/useRegistryApi';
import { promptErrToastWithText, promptSuccessToastWithText } from '../../utils/promptToastHelper';
import { StyledFormButton } from '../common/UI/Button';
import RadioInput from '../common/UI/RadioInput';
import TextAreaInput from '../common/UI/TextAreaInput';
import { ApprovalForm } from './DashboardModal.style';

interface ReviewRequestModalProps {
  profileId: number;
  profiles: any;
  hide: () => void;
  handleSubmitRefresh: any;
}
type HumanActionType = 'approve' | 'reject' | 'commentOnly';

export const ReviewRequestModal: React.FC<ReviewRequestModalProps> = (props) => {
  const { profileId, profiles, hide, handleSubmitRefresh } = props;

  const api = useRegistryApi();
  const { setOpenBackdrop } = useCommonState();
  const profileDetails = profiles.filter((p: any) => p.profileId === profileId).pop();

  const poDetails = `${profileDetails.POName} | ${profileDetails.POEmail}`;
  const tcDetails = `${profileDetails.TCName} | ${profileDetails.TCEmail}`;

  const onSubmit = async (requestBody: any) => {
    setOpenBackdrop(true);
    try {
      if (!requestBody.id) {
        throw new Error('Unable to get request id');
      }

      // 1. Update project request with admin response.
      await api.updateProjectRequest(String(requestBody.id), requestBody);

      // 2. All good? Hide modal and tell the user.
      hide();
      handleSubmitRefresh();
      promptSuccessToastWithText('The project review was successful');
    } catch (err) {
      promptErrToastWithText(err.message);
      console.log(err);
    }
    setOpenBackdrop(false);
  };

  return (
    <>
      <Heading>Project Details</Heading>
      <Flex flexDirection="column">
        <Label htmlFor="project-type">Type</Label>
        <Input name="project-type" placeholder="Create" disabled value={profileDetails.type} />
      </Flex>
      <Flex flexDirection="column">
        <Label htmlFor="project-name">Project Name</Label>
        <Input name="project-name" placeholder="Project X" disabled value={profileDetails.name} />
      </Flex>
      <Flex flexDirection="column">
        <Label htmlFor="project-cluster">Project Cluster</Label>
        <Input
          name="project-cluster"
          placeholder="Silver"
          disabled
          value={profileDetails.primaryClusterName}
        />
      </Flex>
      <Flex flexDirection="column">
        <Label htmlFor="project-description">Description</Label>
        <Textarea
          name="project-description"
          placeholder="A cutting edge web platform that enables Citizens to ..."
          rows={5}
          disabled
          value={profileDetails.description}
        />
      </Flex>
      <Flex flexDirection="column">
        <Label htmlFor="project-cluster">Product Owner</Label>
        <Input
          name="product-owner"
          placeholder="John Doe | john.doe@example.com"
          disabled
          value={poDetails}
          sx={{ textTransform: 'none' }}
        />
      </Flex>
      <Flex flexDirection="column">
        <Label htmlFor="technical-contact">Technical Contact</Label>
        <Input
          name="project-cluster"
          placeholder="Jane Doe | jane.doe@example.com"
          disabled
          value={tcDetails}
          sx={{ textTransform: 'none' }}
        />
      </Flex>
      <Flex flexDirection="column">
        <Label htmlFor="project-quota">Project Quota</Label>
        <Input
          name="project-quota"
          placeholder="Small"
          disabled
          value={
            profileDetails.type === 'create'
              ? profileDetails.quotaSize
              : `${profileDetails.quotaSize} => ${profileDetails.editObject.quota}`
          }
        />
      </Flex>
      <Form onSubmit={onSubmit}>
        {(formProps) => (
          <ApprovalForm onSubmit={formProps.handleSubmit}>
            <Heading>Admin Review</Heading>
            <Field name="id" initialValue={profileDetails.id}>
              {({ input }) => <input type="hidden" {...input} id="id" />}
            </Field>
            <Flex flexWrap="wrap">
              <Label width={1 / 2}>
                <Field<HumanActionType>
                  name="type"
                  component={RadioInput}
                  type="radio"
                  value="approve"
                />
                Approve
              </Label>
              <Label width={1 / 2}>
                <Field<HumanActionType>
                  name="type"
                  component={RadioInput}
                  type="radio"
                  value="reject"
                />
                Reject
              </Label>
            </Flex>
            <Flex flexDirection="column">
              <Label htmlFor="comment">Additional information: </Label>
              <Field
                component={TextAreaInput}
                name="comment"
                placeholder="Provide feedback to the PO/TC regarding your decision for this project."
                rows="5"
              />
            </Flex>
            <StyledFormButton style={{ display: 'block' }}>Submit Response</StyledFormButton>
          </ApprovalForm>
        )}
      </Form>
    </>
  );
};
