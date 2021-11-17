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
import { Box, Flex, Text, Link } from 'rebass';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
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
  namespace: string;
  primaryClusterName: string;
}

interface QuotaSpecsInterface {
  cpuNums: Array<string>;
  memoryNums: Array<string>;
  storageNums: Array<string>;
  snapshotNums: Array<string>;
}

const StyledQuotaEditContainer = styled.div`
  max-width: 60vw;
  width: 50vw;
  padding: 0px;
  @media only screen and (max-width: 810px) {
    max-width: 90vw;
  }
`;

const StyledInformationBox = styled.div`
  max-width: 213px;
  position: absolute;
  z-index: 1;
  background-color: orange;
  border-radius: 10px;
  padding: 5px;
`;
const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
  color: #fcba19;
  :hover {
    cursor: pointer;
  }
`;
const QuotaCardEdit: React.FC<IQuotaCardEditProps> = (props) => {
  const TEMPORARY_DISABLE_FIELD = 'quotaSnapshotSize';
  const DEFAULT_QUOTA_SIZES = {
    quotaCpuSize: [],
    quotaMemorySize: [],
    quotaStorageSize: [],
    quotaSnapshotSize: [],
  };
  const DEFAULT_QUOTA_INFO: QuotaSpecsInterface = {
    cpuNums: [],
    memoryNums: [],
    storageNums: [],
    snapshotNums: [],
  };
  const required = (value: string | boolean) => (value ? undefined : 'Required');
  const QUOTA_DISPLAY_NAME = 'Quota Size';
  const {
    quotaDetails: {
      licensePlate = '',
      quotaSize = {
        quotaCpuSize: '',
        quotaMemorySize: '',
        quotaStorageSize: '',
        quotaSnapshotSize: '',
      },
      quotaOptions = DEFAULT_QUOTA_SIZES,
    },
    profileId,
    handleSubmitRefresh,
    isProvisioned,
    hasPendingEdit,
    namespace,
    primaryClusterName
  } = props;
  const api = useRegistryApi();
  const { setOpenBackdrop } = useCommonState();

  const [goBackToProfileEditable, setGoBackToProfileEditable] = useState<boolean>(false);
  const [specs, setSpecs] = useState<any>({});
  const [applyingQuotaSpecs, setApplyingQuotaSpecs] = useState<any>({});
  const [quotaSizes, setQuotaSizes] = useState<any>({});
  const [displayInfoBox, setDisplayInfoBox] = useState<boolean>(false);
  const getCorrespondingQuota = (selectedSizes: ProjectResourceQuotaSize): QuotaSpecsInterface => {
    console.log('quotaSizesquotaSizesquotaSizes,', quotaSizes)
    if (
      quotaSizes &&
      Object.keys(quotaSizes).length === 0 &&
      Object.getPrototypeOf(quotaSizes) === Object.prototype
    ) {
      return DEFAULT_QUOTA_INFO;
    }
    return {
      cpuNums: quotaSizes[selectedSizes.quotaCpuSize]?.cpuNums || [],
      memoryNums: quotaSizes[selectedSizes.quotaMemorySize]?.memoryNums || [],
      storageNums: quotaSizes[selectedSizes.quotaStorageSize]?.storageNums || [],
      snapshotNums: quotaSizes[selectedSizes.quotaSnapshotSize]?.snapshotNums || [],
    };
  };

  const txtForQuotaEdit =
    "All quota increase requests require Platform Services Team's approval and must have supporting information as per \"Quota Increase Request Process\"(https://developer.gov.bc.ca/Need-more-quota-for-OpenShift-project-set). The Quota Requests without supporting information will NOT be processed";

  const QUOTA_INFORMATION: any = {
    Quota: {
      displayTitle: 'Quota Information',
      options: [{ name: 'LicensePlate', displayName: 'LicensePlate', displayValue: licensePlate, value: licensePlate }],
    },
    cpuNums: {
      displayTitle: 'CPU',
      options: [
        {
          name: 'quotaCpuSize',
          displayName: QUOTA_DISPLAY_NAME,
          value: [quotaSize.quotaCpuSize, ...quotaOptions.quotaCpuSize],
        },
        {
          name: 'current',
          displayName: 'Current',
          value: specs.cpuNums === undefined ? '' : specs.cpuNums,
          displayValue: specs.cpuNums === undefined ? '' : `Request: ${specs.cpuNums[0]} core, Limit: ${specs.cpuNums[1]} core`,
        },
        {
          name: 'upgrade',
          displayName: 'Upgrade to',
          value: specs.cpuNums === undefined ? '' : specs.cpuNums,
          displayValue: ''
        },
      ],
    },
    memoryNums: {
      displayTitle: 'Memory',
      options: [
        {
          name: 'quotaMemorySize',
          displayName: QUOTA_DISPLAY_NAME,
          value: [quotaSize.quotaMemorySize, ...quotaOptions.quotaMemorySize],
        },
        {
          name: 'current',
          displayName: 'Current',
          value: specs.memoryNums === undefined ? '' : specs.memoryNums,
          displayValue: specs.cpuNums === undefined ? '' : `Request: ${specs.memoryNums[0]} GiB, Limit: ${specs.memoryNums[1]} GiB`,
        },
        {
          name: 'upgrade',
          displayName: 'Upgrade to',
          value: specs.cpuNums === undefined ? '' : specs.memoryNums,
          displayValue: ''
        },
      ],
    },
    storageNums: {
      displayTitle: 'Storage',
      options: [
        {
          name: 'quotaStorageSize',
          displayName: QUOTA_DISPLAY_NAME,
          value: [quotaSize.quotaStorageSize, ...quotaOptions.quotaStorageSize],
        },
        {
          name: 'current',
          displayName: 'Current',
          value: specs.storageNums === undefined ? '' : specs.storageNums,
          displayValue: specs.storageNums === undefined ? '' : ` PVC:${specs.storageNums[0]} Overall Storage: ${specs.storageNums[1]} GiB, Backup: ${specs.storageNums[2]} GiB`,
        },
        {
          name: 'upgrade',
          displayName: 'Upgrade to',
          value: specs.storageNums === undefined ? '' : specs.storageNums,
          displayValue: ''
        },

      ],
    },
    snapshotNumber: {
      displayTitle: 'Snapshot',
      options: [
        {
          name: 'quotaSnapshotSize',
          displayName: QUOTA_DISPLAY_NAME,
          value: [quotaSize.quotaSnapshotSize, ...quotaOptions.quotaSnapshotSize],
        },
        {
          name: 'current',
          displayName: 'Current',
          value: specs.snapshotNums === undefined ? '' : specs.snapshotNums,
          displayValue: specs.snapshotNums === undefined ? '' : `Request: ${specs.snapshotNums} GiB`,
        },
      ],
    },
  };

  const handleSubmit = async (formData: any) => {
    const selectedQuotaSize: ProjectResourceQuotaSize = {
      quotaCpuSize: formData.quotaCpuSize,
      quotaMemorySize: formData.quotaMemorySize,
      quotaStorageSize: formData.quotaStorageSize,
      quotaSnapshotSize: formData.quotaSnapshotSize,
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
  if (Object.keys(quotaSizes).length !== 0 && Object.keys(specs).length === 0) {
    const quotaSpecs: QuotaSpecsInterface = getCorrespondingQuota(quotaSize);
    setSpecs(quotaSpecs);
  }

  return (
    <StyledQuotaEditContainer>
      <FormTitle>  Resource Quotas for {licensePlate} project set in {primaryClusterName} cluster </FormTitle>
      <FormSubtitle>
        All quota increase requests require Platform Services Team's approval and must have supporting information as per
        <Link
          color="blue"
          href='https://developer.gov.bc.ca/Need-more-quota-for-OpenShift-project-set'
          target="_blank"
        >
          &nbsp;"Quota Increase Request Process".&nbsp;
        </Link>
        The Quota Requests without supporting information will NOT be processed.
      </FormSubtitle>
      <Flex marginY={2}>
        <Text fontWeight='600' >
          * Attention: You are now viewing the resource quotas for the
          <span style={{ color: 'red' }} >
            &nbsp;{namespace}&nbsp;
          </span>
          namespace
        </Text>
      </Flex>
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
              {QUOTA_INFORMATION[element].options.map((option: any, optionIndex: any) => {
                const hasUserchangeOption =
                  applyingQuotaSpecs[element] &&
                  applyingQuotaSpecs[element].length !== 0 &&
                  option.value !== applyingQuotaSpecs[element]
                return (
                  <Flex
                    marginBottom="2"
                    sx={{ alignItems: 'center' }}
                    key={optionIndex + option.displayName}
                  >

                     {console.log('hiahia, hwat this this specs', specs)}
             
                    {
                      (option.name !== 'upgrade' || hasUserchangeOption) &&
                      < Label variant="adjacentLabel" m="auto" htmlFor="project-quota">
                        {option.displayName}
                      </Label>
                    }

                    {option.name === TEMPORARY_DISABLE_FIELD && (
                      <>
                        <StyledFontAwesomeIcon
                          onMouseEnter={() => setDisplayInfoBox(!displayInfoBox)}
                          onMouseLeave={() => setDisplayInfoBox(!displayInfoBox)}
                          icon={faExclamationTriangle}
                        />
                        <StyledInformationBox
                          style={{ visibility: displayInfoBox ? 'visible' : 'hidden' }}
                        >
                          Only 'small' snapshot volumes are supported right now.
                        </StyledInformationBox>
                      </>
                    )}
                    {option.displayName === QUOTA_DISPLAY_NAME ? (
                      // React-final-form onChange bug: https://github.com/final-form/react-final-form/issues/91

                      <Field
                        name={option.name}
                        disabled={option.name === TEMPORARY_DISABLE_FIELD}
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
                    ) : option.name !== 'upgrade' ? (
                      <Label justifyContent="flex-end">
                        <Text>{option.displayValue}</Text>{' '}
                        {/* {applyingQuotaSpecs[element] &&
                          applyingQuotaSpecs[element].length !== 0 &&
                          applyingQuotaSpecs[element][optionIndex - 1] !== option.value &&
                          element !== 'Quota' &&
                          option.name === 'update' && (
                            <Flex marginLeft="1">
                              {console.log('what is applyingQuotaSpecs', applyingQuotaSpecs)}
                              {console.log('what is element', element)}
                              (optionIndex - 1) because Quota size is taking index 0
                              <Text> to {applyingQuotaSpecs[element][optionIndex - 1]}</Text>
                            </Flex>
                          )} */}

                      </Label>
                    ) : hasUserchangeOption && (
                      <Label justifyContent="flex-end">
                        {console.log('sadf', applyingQuotaSpecs)}
                        <Text>Request: {applyingQuotaSpecs[element][0]} , Limit: {applyingQuotaSpecs[element][1]} </Text>
                      </Label>

                    )
                    }
                  </Flex>
                )
              }
                // else {

                //   if (applyingQuotaSpecs[element] &&
                //     applyingQuotaSpecs[element].length !== 0 &&
                //     applyingQuotaSpecs[element][optionIndex - 1] !== option.value) {

                //     return (
                //       <Flex
                //         marginBottom="2"
                //         sx={{ alignItems: 'center' }}
                //         key={optionIndex + option.displayName}
                //       >

                //         <Label variant="adjacentLabel" m="auto" htmlFor="project-quota">
                //           {option.displayName}
                //         </Label>
                //       </Flex>
                //     )
                //   }
                // }
                // }
              )
              }


              {/* {applyingQuotaSpecs[element] &&
                applyingQuotaSpecs[element].length !== 0 && (

                  <Flex
                    marginBottom="2"
                    sx={{ alignItems: 'center' }}
                  >
                    <Label variant="adjacentLabel" m="auto" htmlFor="project-quota">
                      Upgrade to:
                    </Label>
                    <Label justifyContent="flex-end">
                      <Text>Request: {applyingQuotaSpecs[element][0]} core, Limit: {applyingQuotaSpecs[element][1]} core </Text>{' '}
                    </Label>
                  </Flex>
                )
              } */}
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
                      quotaSnapshotSize: change.values?.quotaSnapshotSize || '',
                    };

                    const selectedQuotaSpecs: QuotaSpecsInterface =
                      Object.keys(quotaSizes).length !== 0
                        ? getCorrespondingQuota(selectedResourceQuota)
                        : DEFAULT_QUOTA_INFO;

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
    </StyledQuotaEditContainer >
  );
};

export default QuotaCardEdit;
