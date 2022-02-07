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
import { Box, Flex, Heading, Text } from 'rebass';
import useCommonState from '../../hooks/useCommonState';
import useRegistryApi from '../../hooks/useRegistryApi';
import { promptErrToastWithText, promptSuccessToastWithText } from '../../utils/promptToastHelper';
import { findDifference, getLicencePlatePostFix } from '../../utils/utils';
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
  displayText: string;
  style?: any;
}
interface DisplayInfomations {
  displayTexts: string[];
}

type HumanActionType = 'approve' | 'reject' | 'commentOnly';

const InformationBox: React.FC<DisplayInfo> = (props) => {
  const { displayText, ...rest } = props;
  return (
    <Box
      fontSize={2}
      bg="#FAFAFA"
      sx={{
        px: 2,
        py: 1,
        borderRadius: 5,
        border: '1px solid black',
      }}
      {...rest}
    >
      {displayText}
    </Box>
  );
};

const InformationBoxes = (props: DisplayInfomations) => {
  const { displayTexts } = props;
  return (
    <>
      {displayTexts.map((displayText: string) => (
        <Box key={displayText} mb={2}>
          <InformationBox displayText={displayText} />
        </Box>
      ))}
    </>
  );
};

export const ReviewRequestModal: React.FC<ReviewRequestModalProps> = (props) => {
  const { profileId, profiles, hide, handleSubmitRefresh } = props;

  const api = useRegistryApi();
  const { setOpenBackdrop } = useCommonState();
  const profileDetails = profiles.filter((p: any) => p.profileId === profileId).pop();
  const textCapitalized = { textTransform: 'capitalize' };
  const typeTextStype =
    profileDetails.type === 'delete'
      ? { color: 'red', textTransform: 'capitalize' }
      : textCapitalized;

  const editNamespace =
    profileDetails.type === 'edit'
      ? getLicencePlatePostFix(profileDetails.editObject.namespace)
      : '';

  const requestedUpdateQuota =
    profileDetails.type === 'edit'
      ? findDifference(profileDetails.editObject.quota, profileDetails.quotaSize[editNamespace])
      : [];

  const parseContacts = (contactDetails: any) => {
    return contactDetails.map(
      (contact: any) => ` ${contact.firstName} ${contact.lastName} | ${contact.email}`,
    );
  };

  const parseUpdatedQuota = (updatedQuotaTypes: any) => {
    return updatedQuotaTypes.map(
      (quotaType: any) =>
        `${quotaType}: ${profileDetails.quotaSize[editNamespace][quotaType]} => ${profileDetails.editObject.quota[quotaType]} `,
    );
  };

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
        <InformationBox style={typeTextStype} displayText={profileDetails.type} />
      </Flex>
      <Flex flexDirection="column">
        <Label htmlFor="project-name">Project Name</Label>
        <InformationBox style={textCapitalized} displayText={profileDetails.name} />
      </Flex>
      <Flex flexDirection="column">
        <Label htmlFor="project-cluster">Project Cluster</Label>
        <InformationBox style={textCapitalized} displayText={profileDetails.clusters.join(', ')} />
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

        <InformationBox displayText={parseContacts(profileDetails.productOwners)} />
      </Flex>
      <Flex flexDirection="column">
        <Label htmlFor="technical-lead">Technical Leads</Label>
        <InformationBoxes displayTexts={parseContacts(profileDetails.technicalLeads)} />
      </Flex>
      <Flex flexDirection="column">
        <Label htmlFor="project-quota">Project Quota</Label>
        {profileDetails.type === 'create' || profileDetails.type === 'delete' ? (
          <>
            {Object.keys(profileDetails.quotaSize).map((key: string) => (
              <Flex flexDirection="column" paddingBottom="1" key={key}>
                {key}
                <InformationBox
                  displayText={`CPU: ${profileDetails.quotaSize[key].quotaCpuSize} | RAM: ${profileDetails.quotaSize[key].quotaMemorySize} |  Storage: ${profileDetails.quotaSize[key].quotaStorageSize} | Snapshot: ${profileDetails.quotaSize[key].quotaSnapshotSize} `}
                />
              </Flex>
            ))}
          </>
        ) : (
          <>
            {profileDetails.editObject.namespace && (
              <Text>Namespace: {profileDetails.editObject.namespace}</Text>
            )}
            <InformationBoxes displayTexts={parseUpdatedQuota(requestedUpdateQuota)} />
          </>
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
