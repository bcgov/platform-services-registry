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

import { useKeycloak } from '@react-keycloak/web';
import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import CreateFormMetadata from '../components/profileCreate/CreateFormMetadata';
import CreateFormPO from '../components/profileCreate/CreateFormPO';
import CreateFormProject from '../components/profileCreate/CreateFormProject';
import CreateFormRequest from '../components/profileCreate/CreateFormRequest';
import CreateFormTC from '../components/profileCreate/CreateFormTC';
import { ROUTE_PATHS } from '../constants';
import useCommonState from '../hooks/useCommonState';
import useRegistryApi from '../hooks/useRegistryApi';
import { promptErrToastWithText, promptSuccessToastWithText } from '../utils/promptToastHelper';
import { transformForm } from '../utils/transformDataHelper';
import Wizard, { WizardPage } from '../utils/Wizard';

const ProfileCreate: React.FC = () => {
  const api = useRegistryApi();
  const { keycloak } = useKeycloak();
  const { setOpenBackdrop } = useCommonState();

  const [ministry, setMinistry] = useState<any>([]);
  const [cluster, setCluster] = useState<any>([]);
  const [goBackToDashboard, setGoBackToDashboard] = useState(false);

  const onSubmit = async (formData: any) => {
    const { profile, productOwner, technicalContact, clusters } = transformForm(formData);
    setOpenBackdrop(true);
    try {
      // 1. Create the project profile.
      const response: any = await api.createProfile(profile);
      const profileId = response.data.id;

      // 2. Create contacts.
      const po: any = await api.createContact(productOwner);
      const tc: any = await api.createContact(technicalContact);

      // 3. Link the contacts to the profile.
      await api.linkContactToProfileById(profileId, po.data.id);
      await api.linkContactToProfileById(profileId, tc.data.id);

      // 4. Trigger provisioning
      await api.createNamespaceByProfileId(profileId, clusters);

      // 4. Create Project Request
      await api.createProjectRequestByProfileId(profileId);

      setOpenBackdrop(false);
      setGoBackToDashboard(true);
      // 5.All good? Tell the user.
      promptSuccessToastWithText('Your namespace request was successful');
    } catch (err) {
      setOpenBackdrop(false);
      const msg = `Unable to submit request at this time, reason = ${err.message}`;
      promptErrToastWithText(msg);
      console.log(err);
    }
  };

  useEffect(() => {
    async function wrap() {
      const ministryResponse = await api.getMinistry();
      const clusterResponse = await api.getCluster();
      setMinistry(ministryResponse.data);
      setCluster(clusterResponse.data);
    }
    wrap();
    // eslint-disable-next-line
  }, [keycloak]);

  if (goBackToDashboard) {
    return <Redirect to={ROUTE_PATHS.DASHBOARD} />;
  }
  return (
    <Wizard onSubmit={onSubmit}>
      <WizardPage>
        <CreateFormProject ministry={ministry} cluster={cluster} />
      </WizardPage>
      <WizardPage>
        <CreateFormMetadata />
      </WizardPage>
      <WizardPage>
        <CreateFormPO />
      </WizardPage>
      <WizardPage>
        <CreateFormTC />
      </WizardPage>
      <WizardPage>
        <CreateFormRequest />
      </WizardPage>
    </Wizard>
  );
};

export default ProfileCreate;
