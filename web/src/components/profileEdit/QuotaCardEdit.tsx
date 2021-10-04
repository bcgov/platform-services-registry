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

import styled from '@emotion/styled';
import { Label } from '@rebass/forms';
import React, { useEffect, useState } from 'react';
import { Field, Form, FormSpy } from 'react-final-form';
import { Redirect } from 'react-router-dom';
import { Box, Flex, Text } from 'rebass';
import { PROFILE_EDIT_VIEW_NAMES, ROUTE_PATHS } from '../../constants';
import useCommonState from '../../hooks/useCommonState';
import useRegistryApi from '../../hooks/useRegistryApi';
import { ProjectResourceQuotaSize } from '../../types';
import { promptErrToastWithText, promptSuccessToastWithText } from '../../utils/promptToastHelper';
import { composeRequestBodyForQuotaEdit } from '../../utils/transformDataHelper';
import CheckboxInput from '../common/UI/CheckboxInput';
import { EditSubmitButton } from '../common/UI/EditSubmitButton';
import FormSubtitle from '../common/UI/FormSubtitle';
import FormTitle from '../common/UI/FormTitle';
import SelectInput from '../common/UI/SelectInput';
import { QuotaDetails } from './QuotaCard';

interface IQuotaCardEditProps {
  profileId?: string;
  quotaDetails: QuotaDetails;
  handleSubmitRefresh: any;
  isProvisioned: boolean;
  hasPendingEdit: boolean;
}

interface QuotaSpecsInterface {
  cpuNums: Array<string>;
  memoryNums: Array<string>;
  storageNums: Array<string>;
}

const StyledQuotaEditContainer = styled.div`
  max-width: 35vw;
  padding: 0px;
  @media only screen and (max-width: 680px) {
    max-width: 90vw;
  }
`;

const QuotaCardEdit: React.FC<IQuotaCardEditProps> = (props) => {
  const required = (value: string | boolean) => (value ? undefined : 'Required');
  const QUOTA_DISPLAY_NAME = 'Quota Size';
  const {
    quotaDetails: {
      licensePlate = '',
      quotaSize = { quotaCpuSize: '', quotaMemorySize: '', quotaStorageSize: '' },
      quotaOptions = {
        quotaCpuSize: [],
        quotaMemorySize: [],
        quotaStorageSize: [],
      },
    },
    profileId,
    handleSubmitRefresh,
    isProvisioned,
    hasPendingEdit,
  } = props;

  const api = useRegistryApi();
  const { setOpenBackdrop } = useCommonState();

  const [goBackToProfileEditable, setGoBackToProfileEditable] = useState<boolean>(false);
  const [specs, setSpecs] = useState<any>([]);
  const [applyingQuotaSpecs, setApplyingQuotaSpecs] = useState<any>({});
  const [quotaSizes, setQuotaSizes] = useState<any>([]);

  const getCorrespondingQuota = (selectedSize: ProjectResourceQuotaSize): QuotaSpecsInterface => {
    let result: QuotaSpecsInterface = {
      cpuNums: [],
      memoryNums: [],
      storageNums: [],
    };
    if (quotaSizes.length > 0) {
      Object.keys(quotaSize).forEach((key) => {
        switch (key) {
          case 'quotaCpuSize':
            result.cpuNums =
              quotaSizes
                .filter((size: any) => size.name.toUpperCase() === selectedSize[key].toUpperCase())
                .pop()?.cpuNums || [];
            break;
          case 'quotaMemorySize':
            result.memoryNums =
              quotaSizes
                .filter((size: any) => size.name.toUpperCase() === selectedSize[key].toUpperCase())
                .pop()?.memoryNums || [];
            break;
          case 'quotaStorageSize':
            result.storageNums =
              quotaSizes
                .filter((size: any) => size.name.toUpperCase() === selectedSize[key].toUpperCase())
                .pop()?.storageNums || [];
            break;
          default:
            result = result;
        }
      });
      return result;
    }
    return result;
  };

  const txtForQuotaEdit =
    "All quota increase requests require Platform Services Team's approval. Please contact the Platform Admins (@cailey.jones, @patrick.simonian or @shelly.han) in RocketChat BEFORE submitting the request to provide justification for the increased need of Platform resources (i.e. historic data showing increased CPU/RAM consumption).";

  const QUOTA_INFORMATION: any = {
    Quota: {
      displayTitle: 'Quota Information',
      identifyer: 'quota_information',
      options: [{ name: 'LicensePlate', displayName: 'LicensePlate', value: licensePlate }],
    },
    cpuNums: {
      displayTitle: 'CPU',
      identifyer: 'cpu',
      options: [
        {
          name: 'quotaCpuSize',
          displayName: QUOTA_DISPLAY_NAME,
          value: [quotaSize.quotaCpuSize, ...quotaOptions.quotaCpuSize],
        },
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
      displayTitle: 'RAM',
      identifyer: 'ram',
      options: [
        {
          name: 'quotaMemorySize',
          displayName: QUOTA_DISPLAY_NAME,
          value: [quotaSize.quotaMemorySize, ...quotaOptions.quotaMemorySize],
        },
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
      displayTitle: 'Storage',
      identifyer: 'storage',
      options: [
        {
          name: 'quotaStorageSize',
          displayName: QUOTA_DISPLAY_NAME,
          value: [quotaSize.quotaStorageSize, ...quotaOptions.quotaStorageSize],
        },
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
    const selectedQuotaSize: ProjectResourceQuotaSize = {
      quotaCpuSize: formData.quotaCpuSize,
      quotaMemorySize: formData.quotaMemorySize,
      quotaStorageSize: formData.quotaStorageSize,
    };
    setOpenBackdrop(true);

    try {
      if (!profileId) {
        throw new Error('Unable to get profile id or quota size');
      }

      // 1. Prepare quota edit request body.
      const requestBody = composeRequestBodyForQuotaEdit(selectedQuotaSize);

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
    const quotaSpecs: QuotaSpecsInterface = getCorrespondingQuota(quotaSize);
    setSpecs(quotaSpecs);
  }

  return (
    <StyledQuotaEditContainer>
      <FormTitle>License plates for the openshift namespaces</FormTitle>
      <FormSubtitle>{txtForQuotaEdit}</FormSubtitle>
      <br />

      <Form
        onSubmit={handleSubmit}
        validate={(values) => {
          const errors = {};
          return errors;
        }}
      >
        {(formProps) => {
          const DisplayQuotaForm = Object.keys(QUOTA_INFORMATION).map((element: any, index) => (
            <Box key={index + QUOTA_INFORMATION[element].displayTitle}>
              <Text as="h3">{QUOTA_INFORMATION[element].displayTitle}</Text>
              {QUOTA_INFORMATION[element].options.map((option: any, optionIndex: any) => (
                <Flex marginBottom="2" key={optionIndex + option.displayName}>
                  <Label variant="adjacentLabel" m="auto" htmlFor="project-quota">
                    {option.displayName}
                  </Label>

                  {option.displayName === QUOTA_DISPLAY_NAME ? (
                    // React-final-form onChange bug: https://github.com/final-form/react-final-form/issues/91
                    <Field
                      name={option.name}
                      component={SelectInput}
                      initialValue={option.value[0]}
                      validate={required}
                    >
                      {option.value.length &&
                        option.value.map((opt: any) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                    </Field>
                  ) : (
                    <Label justifyContent="flex-end">
                      <Text>{option.value}</Text>{' '}
                      {applyingQuotaSpecs[element] &&
                        applyingQuotaSpecs[element].length !== 0 &&
                        applyingQuotaSpecs[element][optionIndex - 1] !== option.value &&
                        element !== 'Quota' && (
                          <Flex marginLeft="1">
                            {/* (optionIndex - 1) because Quota size is taking index 0 */}
                            <Text> to {applyingQuotaSpecs[element][optionIndex - 1]}</Text>
                          </Flex>
                        )}
                    </Label>
                  )}
                </Flex>
              ))}
            </Box>
          ));

          const QuotaChangeComponent = (
            <Flex
              backgroundColor="#eeeeee"
              px={4}
              py={3}
              flexDirection="column"
              sx={{ borderRadius: ' 10px', alignItems: 'center' }}
            >
              <FormTitle>Upgrade/Downgrade Quota</FormTitle>
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
                  <Field
                    name="project-acceptUsage"
                    component={CheckboxInput}
                    validate={required}
                    type="checkbox"
                  />
                </Flex>
              </Flex>

              <EditSubmitButton
                hasPendingEdit={hasPendingEdit}
                isProvisioned={isProvisioned}
                pristine={formProps.pristine}
              />
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
                    const selectedResourceQuota: ProjectResourceQuotaSize = {
                      quotaCpuSize: change.values?.quotaCpuSize || '',
                      quotaMemorySize: change.values?.quotaMemorySize || '',
                      quotaStorageSize: change.values?.quotaStorageSize || '',
                    };
                    const selectedQuotaSpecs: QuotaSpecsInterface = getCorrespondingQuota(
                      selectedResourceQuota,
                    );

                    // setApplyingQuotaSpecs only when change.value is not empty
                    if (
                      !change.values ||
                      Object.keys(change.values).length !== 0 ||
                      Object.getPrototypeOf(change.values) !== Object.prototype
                    ) {
                      setApplyingQuotaSpecs(selectedQuotaSpecs);
                    } else {
                      setApplyingQuotaSpecs({});
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
