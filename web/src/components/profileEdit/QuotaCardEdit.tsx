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
import { ProjectNamespaceResourceQuotaSize, NamespaceQuotaOption } from '../../types';
import { promptErrToastWithText, promptSuccessToastWithText } from '../../utils/promptToastHelper';
import { composeRequestBodyForQuotaEdit } from '../../utils/transformDataHelper';
import CheckboxInput from '../common/UI/CheckboxInput';
import { EditSubmitButton } from '../common/UI/EditSubmitButton';
import FormSubtitle from '../common/UI/FormSubtitle';
import FormTitle from '../common/UI/FormTitle';
import SelectInput from '../common/UI/SelectInput';

export interface NamespaceQuotaDetails {
  quotaSize?: ProjectNamespaceResourceQuotaSize;
}
interface IQuotaCardEditProps {
  profileId?: string;
  licensePlate: string;
  quotaSize: ProjectNamespaceResourceQuotaSize;
  quotaOptions: NamespaceQuotaOption;
  handleSubmitRefresh: any;
  isProvisioned: boolean;
  hasPendingEdit: boolean;
  namespace: string;
  primaryClusterName: string;
}
interface QuotaSizeDedetails {
  quotaCpuSize: CPUQuotaSizeDedetail[];
  quotaMemorySize: MemoryQuotaSizeDedetail[];
  quotaSnapshotSize: StorageQuotaSizeDedetail[];
  quotaStorageSize: SnapshotQuotaSizeDedetail[];
}
interface QuotaSpecsInterface {
  cpuSize: any;
  memorySize: any;
  storageSize: any;
  snapshotSize: any;
}

interface CPUQuotaSizeDedetail {
  id: string;
  cpuRequests: number;
  cpuLimits: number;
}

interface MemoryQuotaSizeDedetail {
  id: string;
  memoryRequests: string;
  memoryLimits: string;
}

interface StorageQuotaSizeDedetail {
  id: string;
  storagePvcCount: number;
  storageFile: string;
  storageBackup: string;
}

interface SnapshotQuotaSizeDedetail {
  id: string;
  snapshotNums: number;
}

interface QuotaDisplayMessageType {
  id: string;
  cpuRequests?: number;
  cpuLimits?: number;
  memoryRequests?: string;
  memoryLimits?: string;
  storageBackup?: string;
  storageFile?: string;
  storagePvcCount?: number;
  snapshotVolume?: number;
}

const StyledQuotaEditContainer = styled.div`
  max-width: 60vw;
  width: 55vw;
  padding: 0px;
  @media only screen and (max-width: 810px) {
    min-width: 90vw;
  }
`;

const StyledInformationBox = styled.div`
  max-width: 213px;
  position: absolute;
  z-index: 1;
  background-color: orange;
  border-radius: 10px;
  padding: 5px;
  margin-left: auto;
  left: 0;
  right: 0;
  margin-right: auto;
`;
const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
  color: #fcba19;
  :hover {
    cursor: pointer;
  }
`;
export const QuotaCardEdit: React.FC<IQuotaCardEditProps> = (props) => {
  const TEMPORARY_DISABLE_FIELD = 'quotaSnapshotSize';
  const DEFAULT_QUOTA_SIZES = {
    quotaCpuSize: [],
    quotaMemorySize: [],
    quotaStorageSize: [],
    quotaSnapshotSize: [],
  };
  const DEFAULT_QUOTA_INFO: QuotaSpecsInterface = {
    cpuSize: {},
    memorySize: {},
    storageSize: {},
    snapshotSize: {},
  };
  const required = (value: string | boolean) => (value ? undefined : 'Required');
  const QUOTA_DISPLAY_NAME = 'Quota Size';
  const {
    licensePlate = '',
    quotaSize = {
      quotaCpuSize: '',
      quotaMemorySize: '',
      quotaStorageSize: '',
      quotaSnapshotSize: '',
    },
    quotaOptions = DEFAULT_QUOTA_SIZES,

    profileId,
    handleSubmitRefresh,
    isProvisioned,
    hasPendingEdit,
    namespace,
    primaryClusterName,
  } = props;
  const api = useRegistryApi();
  const { setOpenBackdrop } = useCommonState();
  const [goBackToProfileEditable, setGoBackToProfileEditable] = useState<boolean>(false);
  const [specs, setSpecs] = useState<any>({});
  const [applyingQuotaSpecs, setApplyingQuotaSpecs] = useState<any>({});
  const [quotaSizes, setQuotaSizes] = useState<any>({});
  const [displayInfoBox, setDisplayInfoBox] = useState<boolean>(false);

  const getCorrespondingQuota = (
    selectedSizes: ProjectNamespaceResourceQuotaSize,
  ): QuotaSpecsInterface => {
    if (
      quotaSizes &&
      Object.keys(quotaSizes).length === 0 &&
      Object.getPrototypeOf(quotaSizes) === Object.prototype
    ) {
      return DEFAULT_QUOTA_INFO;
    }

    const findSelectedQuotaDetail = (resourceType: keyof QuotaSizeDedetails) => {
      const quotaDetail =
        quotaSizes[resourceType].find((quotaOption: CPUQuotaSizeDedetail) => {
          return quotaOption.id === selectedSizes[resourceType];
        }) || {};
      return quotaDetail;
    };

    return {
      cpuSize: findSelectedQuotaDetail('quotaCpuSize'),
      memorySize: findSelectedQuotaDetail('quotaMemorySize'),
      storageSize: findSelectedQuotaDetail('quotaStorageSize'),
      snapshotSize: findSelectedQuotaDetail('quotaSnapshotSize'),
    };
  };

  const buildDisplayMessage = (size: QuotaDisplayMessageType, type: string) => {
    const humanPreferQuotaFormat = (quotaInfo: string = '') => quotaInfo.replace('Gi', 'GiB');
    switch (type) {
      case 'cpu':
        return `Request: ${size.cpuRequests} core, Limit: ${size.cpuLimits} core`;
      case 'memory':
        return `Request: ${humanPreferQuotaFormat(
          size.memoryRequests,
        )}, Limit: ${humanPreferQuotaFormat(size.memoryLimits)}`;
      case 'storage':
        return `PVC: ${size.storagePvcCount}, Overall Storage: ${humanPreferQuotaFormat(
          size.storageFile,
        )}, Backup: ${humanPreferQuotaFormat(size.storageBackup)}`;
      case 'snapshot':
        return `Request: ${size.snapshotVolume} snapshot`;
      default:
        return '';
    }
  };

  const QUOTA_INFORMATION: any = {
    cpuSize: {
      displayTitle: 'CPU',
      options: [
        {
          name: 'quotaCpuSize',
          displayName: QUOTA_DISPLAY_NAME,
          selectedSize: quotaSize.quotaCpuSize,
          value: [...quotaOptions.quotaCpuSize],
        },
        {
          name: 'current',
          displayName: 'Current',
          type: 'cpu',
          value: specs.cpuSize === undefined ? '' : specs.cpuSize,
        },
        {
          name: 'upgrade',
          displayName: 'Upgrade to',
          type: 'cpu',
          value: specs.cpuSize === undefined ? '' : specs.cpuSize,
        },
      ],
    },
    memorySize: {
      displayTitle: 'Memory',
      options: [
        {
          name: 'quotaMemorySize',
          displayName: QUOTA_DISPLAY_NAME,
          selectedSize: quotaSize.quotaMemorySize,
          value: [...quotaOptions.quotaMemorySize],
        },
        {
          name: 'current',
          displayName: 'Current',
          type: 'memory',
          value: specs.memorySize === undefined ? '' : specs.memorySize,
        },
        {
          name: 'upgrade',
          displayName: 'Upgrade to',
          type: 'memory',
          value: specs.cpuSize === undefined ? '' : specs.memorySize,
        },
      ],
    },
    storageSize: {
      displayTitle: 'Storage',
      options: [
        {
          name: 'quotaStorageSize',
          displayName: QUOTA_DISPLAY_NAME,
          selectedSize: quotaSize.quotaStorageSize,
          value: [...quotaOptions.quotaStorageSize],
        },
        {
          name: 'current',
          displayName: 'Current',
          type: 'storage',
          value: specs.storageSize === undefined ? '' : specs.storageSize,
        },
        {
          name: 'upgrade',
          displayName: 'Upgrade to',
          type: 'storage',
          value: specs.storageSize === undefined ? '' : specs.storageSize,
        },
      ],
    },
    snapshotSize: {
      displayTitle: 'Snapshot',
      options: [
        {
          name: 'quotaSnapshotSize',
          displayName: QUOTA_DISPLAY_NAME,
          selectedSize: quotaSize.quotaSnapshotSize,
          value: [...quotaOptions.quotaSnapshotSize],
        },
        {
          name: 'current',
          displayName: 'Current',
          type: 'snapshot',
          value: specs.snapshotSize === undefined ? '' : specs.snapshotSize,
        },
      ],
    },
  };

  const handleSubmit = async (formData: any) => {
    const selectedQuotaSize: ProjectNamespaceResourceQuotaSize = {
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
      const requestBody = composeRequestBodyForQuotaEdit(selectedQuotaSize, namespace);

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
      <FormTitle>
        {' '}
        Resource Quotas for {licensePlate} project set in {primaryClusterName} cluster{' '}
      </FormTitle>
      <FormSubtitle>
        All quota increase requests require Platform Services Team's approval and must have
        supporting information as per
        <Link
          color="blue"
          href="https://developer.gov.bc.ca/Need-more-quota-for-OpenShift-project-set"
          target="_blank"
        >
          &nbsp;"Quota Increase Request Process".&nbsp;
        </Link>
        The Quota Requests without supporting information will NOT be processed.
      </FormSubtitle>
      <Flex marginY={2}>
        <Text fontWeight="600">
          * Attention: You are now viewing the resource quotas for the
          <span style={{ color: 'red' }}>&nbsp;{namespace}&nbsp;</span>
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
                  option.value !== applyingQuotaSpecs[element];
                const selectIndex =
                  option.selectedSize && option.value
                    ? option.value.indexOf(option.selectedSize)
                    : null;
                return (
                  <Flex
                    marginBottom="2"
                    sx={{ alignItems: 'center' }}
                    key={optionIndex + option.displayName}
                  >
                    {(option.name !== 'upgrade' || hasUserchangeOption) && (
                      <Label variant="adjacentLabel" m="auto" htmlFor="project-quota">
                        {option.displayName}
                      </Label>
                    )}

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
                          Only 'snapshot-5' are supported right now.
                        </StyledInformationBox>
                      </>
                    )}
                    {option.displayName === QUOTA_DISPLAY_NAME && selectIndex !== null ? (
                      // React-final-form onChange bug: https://github.com/final-form/react-final-form/issues/91

                      <Field
                        name={option.name}
                        disabled={option.name === TEMPORARY_DISABLE_FIELD}
                        component={SelectInput}
                        initialValue={option.value[selectIndex]}
                        validate={required}
                      >
                        {option.value.length &&
                          option.value.map((opt: any) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                      </Field>
                    ) : option.name !== 'upgrade' && option.type && option.value ? (
                      <Label justifyContent="flex-end">
                        <Text fontSize={2}>{buildDisplayMessage(option.value, option.type)}</Text>
                      </Label>
                    ) : (
                      hasUserchangeOption &&
                      option.type && (
                        <Label justifyContent="flex-end">
                          <Text fontSize={2}>
                            {buildDisplayMessage(applyingQuotaSpecs[element], option.type)}
                          </Text>{' '}
                        </Label>
                      )
                    )}
                  </Flex>
                );
              })}
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
                    const selectedResourceQuota: ProjectNamespaceResourceQuotaSize = {
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
    </StyledQuotaEditContainer>
  );
};

export default QuotaCardEdit;
