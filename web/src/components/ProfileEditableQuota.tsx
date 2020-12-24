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
import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Text } from 'rebass';
import { StyledFormButton, StyledFormDisabledButton } from '../components/UI/button';
import { PROFILE_VIEW_NAMES, QUOTA_SIZES, ROUTE_PATHS } from '../constants';
import theme from '../theme';
import { CNQuotaOptions, QuotaSizeSet } from '../types';
import { promptErrToastWithText, promptSuccessToastWithText } from '../utils/promptToastHelper';
import { composeRequestBodyForQuotaEdit } from '../utils/transformDataHelper';
import useRegistryApi from '../utils/useRegistryApi';
import SubFormTitle from './UI/subFormTitle';

interface IProfileEditableQuotaProps {
    licensePlate: string;
    quotaSize: QuotaSizeSet | '';
    profileId?: string;
    quotaOptions: any[];
    cnQuotaOptionsJson: CNQuotaOptions[];
    openBackdropCB: () => void;
    closeBackdropCB: () => void;
    handleQuotaSubmitRefresh: any;
}

const ProfileEditableQuota: React.FC<IProfileEditableQuotaProps> = (props) => {
    const api = useRegistryApi();

    const { licensePlate, quotaSize, profileId, quotaOptions, cnQuotaOptionsJson, openBackdropCB, closeBackdropCB, handleQuotaSubmitRefresh } = props;

    const [goBackToProfileEditable, setGoBackToProfileEditable] = useState<boolean>(false);
    const [selectedSize, setSelectedSize] = useState('');

    const specs = QUOTA_SIZES.filter((size: any) => { return size.name === quotaSize }).pop();

    const handleChange = (event: any) => {
        setSelectedSize(event.target.value);
    };

    const handleSubmit = async () => {
        openBackdropCB();
        try {
            if (!profileId || !quotaSize) {
                throw new Error(`'Unable to get profile id'`);
            }

            // 1. Prep quota request body.
            // @ts-ignore
            const requestBody = composeRequestBodyForQuotaEdit(selectedSize, cnQuotaOptionsJson);

            // 2. Trigger quota request call
            await api.requestCNQuotasByProfileId(profileId, requestBody);

            closeBackdropCB();
            handleQuotaSubmitRefresh();
            setGoBackToProfileEditable(true);

            // 3.All good? Tell the user.
            promptSuccessToastWithText('Your quota request was successful');
        } catch (err) {
            closeBackdropCB();
            promptErrToastWithText('Something went wrong');
            console.log(err);
        }
    };
    if (goBackToProfileEditable && profileId) {
        return (<Redirect to={
            ROUTE_PATHS.PROFILE_EDITABLE.replace(':profileId', profileId).replace(':viewName', PROFILE_VIEW_NAMES.OVERVIEW)
        } />);
    }
    if (!specs) {
        return null;
    } else {
        return (
            <>
                <SubFormTitle>License plates for the openshift namespaces</SubFormTitle>
                <Label m="0" htmlFor="project-quotaCpu">{licensePlate}</Label>
                <br />
                <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
                    {quotaSize.toUpperCase()} size quota for CPU:
                    <br />
                    {specs.cpuNums[0]} cores as request, {specs.cpuNums[1]} cores as limit
                </Text>
                <br />
                <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
                    {quotaSize.toUpperCase()} size quota for RAM:
                    <br />
                    {specs.memoryNums[0]}GBs as request, {specs.memoryNums[1]}GBs as limit
                </Text>
                <br />
                <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
                    {quotaSize.toUpperCase()} size quota for storage: 20 PVC count,
                    <br />
                    {specs.storageNums[0]}Gbs overall storage with {specs.storageNums[1]}GBs for backup storage
                </Text>
                <br />
                <select value={selectedSize} onChange={handleChange}>
                    <option>Select...</option>
                    {/* @ts-ignore */}
                    {(quotaOptions.length !== 0) && quotaOptions.map((opt: any) => (
                        <option
                            key={opt}
                            value={opt}
                        >
                            {opt}
                        </option>
                    ))}
                </select>
                {quotaOptions.length !== 0 && quotaOptions.includes(selectedSize) ? (
                    //@ts-ignore
                    <StyledFormButton style={{ display: 'block' }} onClick={handleSubmit}>Request Quota</StyledFormButton>
                ) : (
                        <>
                            {/* @ts-ignore */}
                            <StyledFormDisabledButton style={{ display: 'block' }}>Request Quota</StyledFormDisabledButton>
                            {quotaOptions.length === 0 && (
                                <Label as="span" variant="errorLabel" >Not available due to a pending provisioning status / quota request</Label>
                            )}
                        </>
                    )}
            </>
        );
    }
};

export default ProfileEditableQuota;
