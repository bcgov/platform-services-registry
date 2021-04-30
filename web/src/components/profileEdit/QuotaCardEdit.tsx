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
import { Redirect } from 'react-router-dom';
import { Text } from 'rebass';
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

const QuotaCardEdit: React.FC<IQuotaCardEditProps> = (props) => {
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
  const [selectedSize, setSelectedSize] = useState<any>('');
  const [specs, setSpecs] = useState<any>([]);

  const handleChange = (event: any) => {
    setSelectedSize(event.target.value);
  };

  const handleSubmit = async () => {
    setOpenBackdrop(true);
    try {
      if (!profileId || !quotaSize) {
        throw new Error('Unable to get profile id or quota size');
      }

      // 1. Prepare quota edit request body.
      const requestBody = composeRequestBodyForQuotaEdit(selectedSize);

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
    async function getQuotaSizes() {
      const quotaSizes = await api.getQuotaSizes();
      setSpecs(quotaSizes.data.filter((size: any) => size.name === quotaSize).pop());
    }
    getQuotaSizes();
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

  if (specs.length === 0) {
    return null;
  }
  return (
    <>
      <FormTitle>License plates for the openshift namespaces</FormTitle>
      <Label m="0" htmlFor="project-quotaCpuSize">
        {licensePlate}
      </Label>
      <br />
      <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
        {quotaSize.toUpperCase()} size quota for CPU:
        <br />
        {specs.cpuNums[0]} cores as request,{specs.cpuNums[1]} cores as limit
      </Text>
      <br />
      <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
        {quotaSize.toUpperCase()} size quota for RAM:
        <br />
        {specs.memoryNums[0]} as request, {specs.memoryNums[1]} as limit
      </Text>
      <br />
      <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
        {quotaSize.toUpperCase()} size quota for storage: 20 PVC count,
        <br />
        {specs.storageNums[0]} overall storage with {specs.storageNums[1]} for backup storage
      </Text>
      <br />
      <select value={selectedSize} onChange={handleChange}>
        <option>Select...</option>
        {/* @ts-ignore */}

        {quotaOptions.length !== 0 &&
          quotaOptions.map((opt: any) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
      </select>
      {!hasPendingEdit && isProvisioned && selectedSize !== '' ? (
        // @ts-ignore
        <StyledFormButton style={{ display: 'block' }} onClick={handleSubmit}>
          Request Quota
        </StyledFormButton>
      ) : (
        // @ts-ignore
        <StyledFormDisabledButton style={{ display: 'block' }}>
          Request Quota
        </StyledFormDisabledButton>
      )}
      {!(!hasPendingEdit && isProvisioned) && (
        <Label as="span" variant="errorLabel">
          Not available due to a {isProvisioned ? 'Update' : 'Provision'} Request
        </Label>
      )}
    </>
  );
};

export default QuotaCardEdit;
