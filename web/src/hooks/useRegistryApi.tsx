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
import type { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';
import { useEffect, useRef } from 'react';
import { API } from '../constants';

const useAxios = () => {
  const axiosInstance = useRef<AxiosInstance>();
  const { keycloak, initialized } = useKeycloak();
  const kcToken = keycloak?.token ?? '';

  useEffect(() => {
    axiosInstance.current = axios.create({
      baseURL: API.BASE_URL(),
      headers: {
        Accept: 'application/json',
        Authorization: initialized ? `Bearer ${kcToken}` : undefined,
      },
    });

    return () => {
      axiosInstance.current = undefined;
    };
  }, [initialized, kcToken]);

  return axiosInstance;
};

const errorMsg = 'axios instance not initialized';

export default function useRegistryApi() {
  const axiosInstance = useAxios();

  const getMinistry = async (): Promise<AxiosResponse<any>> => {
    if (!axiosInstance.current) {
      throw new Error(errorMsg);
    } else {
      return axiosInstance.current.get('ministry');
    }
  };

  const getProfile = async (): Promise<AxiosResponse<any>> => {
    if (!axiosInstance.current) {
      throw new Error(errorMsg);
    } else {
      return axiosInstance.current.get('profile');
    }
  };

  const createProfile = async (profile: any): Promise<AxiosResponse<any>> => {
    if (!axiosInstance.current) {
      throw new Error(errorMsg);
    } else {
      return axiosInstance.current.post('profile', profile);
    }
  };

  const updateProfile = async (profileId: string, profile: any): Promise<AxiosResponse<any>> => {
    if (!axiosInstance.current) {
      throw new Error(errorMsg);
    } else {
      return axiosInstance.current.put(`profile/${profileId}`, profile);
    }
  };

  const createContact = async (contact: any): Promise<AxiosResponse<any>> => {
    if (!axiosInstance.current) {
      throw new Error(errorMsg);
    } else {
      return axiosInstance.current.post('contact', contact);
    }
  };

  const updateContactsByProfileId = async (
    profileId: string,
    requestedContacts: any,
  ): Promise<AxiosResponse<any>> => {
    if (!axiosInstance.current) {
      throw new Error(errorMsg);
    } else {
      return axiosInstance.current.post(`profile/${profileId}/contacts`, requestedContacts);
    }
  };

  const linkContactToProfileById = async (
    profileId: string,
    contactId: string,
  ): Promise<AxiosResponse<any>> => {
    if (!axiosInstance.current) {
      throw new Error(errorMsg);
    } else {
      return axiosInstance.current.post(`profile/${profileId}/contact/${contactId}`);
    }
  };

  const createNamespaceByProfileId = async (profileId: string): Promise<AxiosResponse<any>> => {
    if (!axiosInstance.current) {
      throw new Error(errorMsg);
    } else {
      return axiosInstance.current.post(`provision/${profileId}/namespace`);
    }
  };

  const getContactsByProfileId = async (profileId: string): Promise<AxiosResponse<any>> => {
    if (!axiosInstance.current) {
      throw new Error(errorMsg);
    } else {
      return axiosInstance.current.get(`profile/${profileId}/contacts`);
    }
  };

  const getProfileByProfileId = async (profileId: string): Promise<AxiosResponse<any>> => {
    if (!axiosInstance.current) {
      throw new Error(errorMsg);
    } else {
      return axiosInstance.current.get(`profile/${profileId}`);
    }
  };

  const getNamespacesByProfileId = async (profileId: string): Promise<AxiosResponse<any>> => {
    if (!axiosInstance.current) {
      throw new Error(errorMsg);
    } else {
      return axiosInstance.current.get(`profile/${profileId}/namespace`);
    }
  };

  const getQuotaSizeByProfileId = async (profileId: string): Promise<AxiosResponse<any>> => {
    if (!axiosInstance.current) {
      throw new Error(errorMsg);
    } else {
      return axiosInstance.current.get(`profile/${profileId}/quota-size`);
    }
  };

<<<<<<< HEAD
  const getAllowedQuotaSizesByProfileId = async (
    profileId: string,
  ): Promise<AxiosResponse<any>> => {
=======
  const getAllowedQuotaSizesByProfileId = async (profileId: string): Promise<AxiosResponse<any>> => {
>>>>>>> 5fc9710 (refactor and modify unit tests)
    if (!axiosInstance.current) {
      throw new Error(errorMsg);
    } else {
      return axiosInstance.current.get(`profile/${profileId}/allowed-quota-sizes`);
    }
  };

  const updateQuotaSizeByProfileId = async (
    profileId: string,
    requstedQuotas: any,
  ): Promise<AxiosResponse<any>> => {
    if (!axiosInstance.current) {
      throw new Error(errorMsg);
    } else {
      return axiosInstance.current.post(`profile/${profileId}/quota-size`, requstedQuotas);
    }
  };

  const getEditRequestStatus = async (profileId: string): Promise<AxiosResponse<any>> => {
    if (!axiosInstance.current) {
      throw new Error(errorMsg);
    } else {
      return axiosInstance.current.get(`profile/${profileId}/request`);
    }
  };

  return {
    getMinistry,
    getProfile,
    createProfile,
    updateProfile,
    createContact,
    updateContactsByProfileId,
    linkContactToProfileById,
    createNamespaceByProfileId,
    getContactsByProfileId,
    getNamespacesByProfileId,
    getQuotaSizeByProfileId,
    getProfileByProfileId,
    getAllowedQuotaSizesByProfileId,
    updateQuotaSizeByProfileId,
    getEditRequestStatus,
  };
}
