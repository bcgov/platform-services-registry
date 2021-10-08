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

import { Label, Textarea } from '@rebass/forms';
import React from 'react';
import { Field, Form } from 'react-final-form';
import { Box, Flex, Heading } from 'rebass';
import useCommonState from '../../hooks/useCommonState';
import useRegistryApi from '../../hooks/useRegistryApi';
import { promptErrToastWithText, promptSuccessToastWithText } from '../../utils/promptToastHelper';
import { findDifferenceBetweenTwoDifferentObject } from '../../utils/utils';
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

interface DisplayInfo {
  displayTexts: string[];
  nonetextTransform?: boolean;
}

type HumanActionType = 'approve' | 'reject' | 'commentOnly';

const InformationBox: React.FC<any> = (props) => {
  const { nonetextTransform, displayTexts } = props;
  return displayTexts.map((displayText: string) => (
    <Box key={displayText} mb={1}>
      <Box
        fontSize={2}
        bg="#FAFAFA"
        sx={{
          px: 2,
          py: 2,
          borderRadius: 5,
          border: '1px solid black',
          textTransform: nonetextTransform ? 'none' : 'capitalize',
        }}
      >
        {displayText}
      </Box>
    </Box>
  ));
};

export const ReviewRequestModal: React.FC<ReviewRequestModalProps> = (props) => {
  const { profileId, profiles, hide, handleSubmitRefresh } = props;

  const api = useRegistryApi();
  const { setOpenBackdrop } = useCommonState();
  const profileDetails = profiles.filter((p: any) => p.profileId === profileId).pop();

  const parseContacts = (contactDetails: any) => {
    return contactDetails.map(
      (contact: any) => ` ${contact.firstName} ${contact.lastName} | ${contact.email}`,
    );
  };

  const parseUpdatedQuota = (updatedQuotaTypes: any) => {
    return updatedQuotaTypes.map(
      (quotaType: any) =>
        `${quotaType}: ${profileDetails.quotaSize[quotaType]} => ${profileDetails.editObject.quota[quotaType]} `,
    );
  };

  const requestedUpdateQuota =
    profileDetails.type === 'edit'
      ? findDifferenceBetweenTwoDifferentObject(
          profileDetails.editObject.quota,
          profileDetails.quotaSize,
        )
      : [];

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
        <InformationBox displayTexts={[`${profileDetails.type}`]} />
      </Flex>
      <Flex flexDirection="column">
        <Label htmlFor="project-name">Project Name</Label>
        <InformationBox displayTexts={[`${profileDetails.name}`]} />
      </Flex>
      <Flex flexDirection="column">
        <Label htmlFor="project-cluster">Project Cluster</Label>
        <InformationBox displayTexts={[profileDetails.clusters.join(', ')]} />
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
        <Label htmlFor="product-owner">Product Owner</Label>

        <InformationBox
          nonetextTransform
          displayTexts={parseContacts(profileDetails.productOwners)}
        />
      </Flex>
      <Flex flexDirection="column">
        <Label htmlFor="technical-lead">Technical Leads</Label>
        <InformationBox
          nonetextTransform
          displayTexts={parseContacts(profileDetails.technicalLeads)}
        />
      </Flex>
      <Flex flexDirection="column">
        <Label htmlFor="project-quota">Project Quota</Label>
        {profileDetails.type === 'create' ? (
          <InformationBox
            displayTexts={[
              `CPU: ${profileDetails.quotaSize.quotaCpuSize} | RAM: ${profileDetails.quotaSize.quotaMemorySize} |  Storage: ${profileDetails.quotaSize.quotaStorageSize}`,
            ]}
          />
        ) : (
          <Box mb={3}>
            <InformationBox displayTexts={parseUpdatedQuota(requestedUpdateQuota)} />
          </Box>
        )}
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
