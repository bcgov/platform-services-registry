/* eslint-disable react/no-array-index-key */
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

import { Label } from '@rebass/forms';
import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Field, Form, FormSpy } from 'react-final-form';
import { Redirect } from 'react-router-dom';
import { Flex, Text, Box } from 'rebass';
import CheckboxInput from '../common/UI/CheckboxInput';
import SelectInput from '../common/UI/SelectInput';
import { PROFILE_EDIT_VIEW_NAMES, ROUTE_PATHS } from '../../constants';
import useCommonState from '../../hooks/useCommonState';
import useRegistryApi from '../../hooks/useRegistryApi';
import theme from '../../theme';
import { promptErrToastWithText, promptSuccessToastWithText } from '../../utils/promptToastHelper';
import { composeRequestBodyForQuotaEdit } from '../../utils/transformDataHelper';
import { StyledFormButton, StyledFormDisabledButton } from '../common/UI/Button';
import FormTitle from '../common/UI/FormTitle';
import { QuotaDetails } from './QuotaCard';

interface IQuotaCardEditProps {
  profileId?: string;
  quotaDetails: QuotaDetails;
  handleSubmitRefresh: any;
  isProvisioned: boolean;
  hasPendingEdit: boolean;
}

const StyledQuotaEditContainer = styled.div`
  max-width: 35vw;
  padding: 0px;
  @media only screen and (max-width: 680px) {
    max-width: 90vw;
    color: red;
  }
`;

const QuotaCardEdit: React.FC<IQuotaCardEditProps> = (props) => {
  // @ts-ignore
  const required = (value) => (value ? undefined : 'Required');

  const {
    quotaDetails: { licensePlate = '', quotaSize = '', quotaOptions = [] },
    profileId,
    handleSubmitRefresh,
    isProvisioned,
    hasPendingEdit,
  } = props;

  const api = useRegistryApi();
  const { setOpenBackdrop } = useCommonState();

  const [goBackToProfileEditable, setGoBackToProfileEditable] = useState<boolean>(false);
  const [specs, setSpecs] = useState<any>([]);
  const [applyingQuotaSpecs, setApplyingQuotaSpecs] = useState<any>([]);
  const [quotaSizes, setQuotaSizes] = useState<any>({});

  const QUOTAINFORMATIONCONSTANTS: any = {
    Quota: {
      title: 'Quota Information',
      options: [
        { name: 'QuotaSize', displayName: 'Quota size', value: quotaSize.toUpperCase() },
        { name: 'LicensePlate', displayName: 'LicensePlate', value: licensePlate },
      ],
    },
    cpuNums: {
      title: 'CPU',
      options: [
        {
          name: 'Request',
          displayName: 'Request',
          value: specs.cpuNums === undefined ? '' : specs.cpuNums[0],
        },
        {
          name: 'Limit',
          displayName: 'Limit',
          value: specs.cpuNums === undefined ? '' : specs.cpuNums[1],
        },
      ],
    },
    memoryNums: {
      title: 'RAM',
      options: [
        {
          name: 'Request',
          displayName: 'Request',
          value: specs.memoryNums === undefined ? '' : specs.memoryNums[0],
        },
        {
          name: 'Limit',
          displayName: 'Limit',
          value: specs.memoryNums === undefined ? '' : specs.memoryNums[1],
        },
      ],
    },
    storageNums: {
      title: 'Storage',
      options: [
        {
          name: 'PVCCount',
          displayName: 'PVC Count',
          value: specs.storageNums === undefined ? '' : specs.storageNums[0],
        },
        {
          name: 'OverallStorage',
          displayName: 'Overall Storage',
          value: specs.storageNums === undefined ? '' : specs.storageNums[1],
        },
        {
          name: 'BackupStorage',
          displayName: 'Backup Storage',
          value: specs.storageNums === undefined ? '' : specs.storageNums[2],
        },
      ],
    },
  };

  const handleSubmit = async (formData: any) => {
    if (formData.selectedSize?.split(' ')[0] === 'Current:') {
      setGoBackToProfileEditable(true);
      promptSuccessToastWithText('Your quota will remains the same');
      return;
    }
    if (formData.selectedSize) setOpenBackdrop(true);
    try {
      if (!profileId || !quotaSize) {
        throw new Error('Unable to get profile id or quota size');
      }

      // 1. Prepare quota edit request body.
      const requestBody = composeRequestBodyForQuotaEdit(formData.selectedSize);

      // 2. Request the profile quota edit.
      await api.updateQuotaSizeByProfileId(profileId, requestBody);

      // 3. All good? Redirect back to overview and tell the user.
      handleSubmitRefresh();
      setGoBackToProfileEditable(true);
      promptSuccessToastWithText('Your quota request was successful');
    } catch (err) {
      promptErrToastWithText(err.message);
      console.log(err);
    }
    setOpenBackdrop(false);
  };

  useEffect(() => {
    (async () => {
      try {
        const fetchQuotaSizesInformation = await api.getQuotaSizes();
        await setQuotaSizes(fetchQuotaSizesInformation.data);
      } catch (err) {
        console.log(err);
      }
    })();
    // eslint-disable-next-line
  }, []);

  if (goBackToProfileEditable && profileId) {
    return (
      <Redirect
        to={ROUTE_PATHS.PROFILE_EDIT.replace(':profileId', profileId).replace(
          ':viewName',
          PROFILE_EDIT_VIEW_NAMES.OVERVIEW,
        )}
      />
    );
  }

  if (Object.entries(quotaSizes).length !== 0 && specs.length === 0) {
    setSpecs(quotaSizes.filter((size: any) => size.name === quotaSize).pop());
  }

  return (
    <StyledQuotaEditContainer>
      <FormTitle>License plates for the openshift namespaces</FormTitle>

      <br />

      <Form
        onSubmit={handleSubmit}
        validate={(values) => {
          const errors = {};
          return errors;
        }}
      >
        {(formProps) => {
          const DisplayQuotaForm = Object.keys(QUOTAINFORMATIONCONSTANTS).map(
            (element: any, index) => (
              <Box key={index + QUOTAINFORMATIONCONSTANTS[element].title}>
                <Text as="h3">{QUOTAINFORMATIONCONSTANTS[element].title}</Text>
                <Flex flexDirection="column" paddingLeft="4">
                  {QUOTAINFORMATIONCONSTANTS[element].options.map(
                    (option: any, optionIndex: any) => (
                      <Flex marginBottom="2" key={optionIndex + option.displayName}>
                        <Label variant="adjacentLabel" m="auto" htmlFor="project-quota">
                          {option.displayName}
                        </Label>

                        <Flex flex="1 1 auto" justifyContent="flex-end" name="project-quota">
                          {option.name === 'QuotaSize' ? (
                            // React-final-form onChange bug: https://github.com/final-form/react-final-form/issues/91
                            <Field
                              name="selectedSize"
                              component={SelectInput}
                              initialValue={`Current: ${option.value}`}
                              validate={required}
                            >
                              <option> Current: {option.value} </option>
                              {quotaOptions.length !== 0 &&
                                quotaOptions.map((opt: any) => (
                                  <option key={opt} value={opt}>
                                    {opt.toUpperCase()}
                                  </option>
                                ))}
                            </Field>
                          ) : (
                            <Label justifyContent="flex-end">
                              <Text>{option.value}</Text>{' '}
                              {applyingQuotaSpecs.length !== 0 && element !== 'Quota' && (
                                <Flex marginLeft="1">
                                  <Text> to {applyingQuotaSpecs[element][optionIndex]}</Text>
                                </Flex>
                              )}
                            </Label>
                          )}
                        </Flex>
                      </Flex>
                    ),
                  )}
                </Flex>
              </Box>
            ),
          );

          const QuotaChangeComponent = (
            <Flex
              backgroundColor={theme.colors.grey}
              paddingX={4}
              paddingY={3}
              flexDirection="column"
              sx={{ borderRadius: ' 10px', alignItems: 'center' }}
            >
              <FormTitle>Upgrade Quota</FormTitle>
              <Flex mt={3}>
                <Label m="auto" width={3 / 4}>
                  <Text as="h3" fontSize="16px" my={0} lineHeight="normal">
                    Important Information - By check this checkbox, you confirmed that you have read{' '}
                    <a
                      rel="noopener noreferrer"
                      href="https://developer.gov.bc.ca/Need-more-quota-for-OpenShift-project-set"
                      target="_blank"
                    >
                      this document
                    </a>{' '}
                    before submitting your quota increase requirement
                  </Text>
                </Label>
                <Flex flex="1 1 auto" justifyContent="flex-end">
                  <Field<boolean>
                    name="project-acceptUsage"
                    component={CheckboxInput}
                    validate={required}
                    type="checkbox"
                  />
                </Flex>
              </Flex>

              {!hasPendingEdit && isProvisioned ? (
                // @ts-ignore
                <StyledFormButton type="submit" style={{ display: 'block' }}>
                  Request Quota
                </StyledFormButton>
              ) : (
                // @ts-ignore
                <StyledFormDisabledButton style={{ display: 'block', margin: '10px auto' }}>
                  Request Quota
                </StyledFormDisabledButton>
              )}
              {!(!hasPendingEdit && isProvisioned) && (
                <Label as="span" variant="errorLabel">
                  Not available due to a {isProvisioned ? 'Update' : 'Provision'} Request
                </Label>
              )}
            </Flex>
          );
          return (
            <form onSubmit={formProps.handleSubmit}>
              <FormSpy
                subscription={{ values: true }}
                onChange={(change) => {
                  // React-final-form bug: https://github.com/final-form/react-final-form/issues/809
                  // Use setTimeout to Avoid error message
                  setTimeout(() => {
                    // fired during rendering, calling a `useState` setter fails
                    const selectedSizePostFix = change.values.selectedSize?.split(' ');
                    if (selectedSizePostFix && selectedSizePostFix.length === 1) {
                      setApplyingQuotaSpecs(
                        quotaSizes
                          .filter((size: any) => size.name === selectedSizePostFix[0])
                          .pop(),
                      );
                    } else {
                      setApplyingQuotaSpecs([]);
                    }
                  }, 0);
                }}
              />
              <>{DisplayQuotaForm}</>
              <>{QuotaChangeComponent}</>
            </form>
          );
        }}
      </Form>
    </StyledQuotaEditContainer>
  );
};

export default QuotaCardEdit;
