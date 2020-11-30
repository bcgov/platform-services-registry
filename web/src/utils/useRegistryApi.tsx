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
import axios, { AxiosResponse } from 'axios';
import { useMemo } from 'react';
import { API } from '../constants';

export const useApi = () => {
  const { keycloak } = useKeycloak();
  const instance = useMemo(() => {
    return axios.create({
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${keycloak?.token}`
      },
      baseURL: API.BASE_URL()
    });
  }, [keycloak]);

  return instance;
};

export default function useRegistryApi() {
  const api = useApi();

  const getMinistry = async (): Promise<AxiosResponse<any>> => {
    return api.get('ministry');
  };

  const getProfile = async (): Promise<AxiosResponse<any>> => {
    return api.get('profile');
  };

  const createProfile = async (profile: any): Promise<AxiosResponse<any>> => {
    return api.post('profile', profile);
  };

  const createContact = async (contact: any): Promise<AxiosResponse<any>> => {
    return api.post('contact', contact);
  };

  const linkContactToProfileById = async (profileId: string, contactId: string): Promise<AxiosResponse<any>> => {
    return api.post(`profile/${profileId}/contact/${contactId}`);
  };

  const createNamespaceByProfileId = async (profileId: string): Promise<AxiosResponse<any>> => {
    return api.post(`provision/${profileId}/namespace`);
  };

  const getContactsByProfileId = async (profileId: string): Promise<AxiosResponse<any>> => {
    return api.get(`profile/${profileId}/contacts`);
  };

  const getNamespaceByProfileId = async (profileId: string): Promise<AxiosResponse<any>> => {
    return api.get(`profile/${profileId}/namespace`);
  };

  const getProfileByProfileId = async (profileId: string): Promise<AxiosResponse<any>> => {
    return api.get(`profile/${profileId}`);
  };

  return {
    getMinistry,
    getProfile,
    createProfile,
    createContact,
    linkContactToProfileById,
    createNamespaceByProfileId,
    getContactsByProfileId,
    getNamespaceByProfileId,
    getProfileByProfileId
  };
};
