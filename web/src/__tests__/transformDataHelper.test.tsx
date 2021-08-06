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

import {
  convertSnakeCaseToSentence,
  flatten,
  getClusterDisplayName,
  getProfileMinistry,
  isProfileProvisioned,
  transformJsonToCsv,
} from '../utils/transformDataHelper';
import silverCluster from './fixtures/cluster.json';
import profileMinistry from './fixtures/profile-ministry.json';
import profileNamespaces from './fixtures/profile-namespaces.json';
import flattenedProfiles from './fixtures/profiles-flattened.json';
import profiles from './fixtures/profiles.json';

describe('test the helper function isProfileProvisioned', () => {
  test('should return true if all namespaces under a profile primary cluster are provisioned', () => {
    const profile = { primaryClusterName: 'silver' };
    expect(isProfileProvisioned(profile, profileNamespaces)).toEqual(true);
  });
});

describe('test the helper function getProfileMinistry', () => {
  test('should return an object with key-values pairs for PO email and TC email', () => {
    const ministry = { busOrgId: 'ALC' };
    expect(getProfileMinistry(profileMinistry, ministry)).toEqual({
      ministryName: 'Agriculture Land Commission',
    });
  });
});

describe('test the helper function transformJsonToCsv', () => {
  test('should return correct csv', () => {
    const result =
      'id,name,description,ministry,namespacePrefix,profileStatus,quotaSize,clusters.0,clusters.1,productOwners.0.firstName,productOwners.0.lastName,productOwners.0.email,productOwners.0.githubId,technicalLeads.0.firstName,technicalLeads.0.lastName,technicalLeads.0.email,technicalLeads.0.githubId,technicalLeads.1.firstName,technicalLeads.1.lastName,technicalLeads.1.email,technicalLeads.1.githubId,profileMetadata.notificationEmail,profileMetadata.notificationSMS,profileMetadata.notificationMSTeams,profileMetadata.paymentBambora,profileMetadata.paymentPayBC,profileMetadata.fileTransfer,profileMetadata.fileStorage,profileMetadata.geoMappingWeb,profileMetadata.geoMappingLocation,profileMetadata.schedulingCalendar,profileMetadata.schedulingAppointments,profileMetadata.identityManagementSiteMinder,profileMetadata.identityManagementKeycloak,profileMetadata.identityManagementActiveDir\r\n3,"Test Project C","Lorem ipsum doler","CITZ","7f04fa","approved","small","Gold Kamloops","Gold (DR) Calgary","Jack","Dough","jack.dough@example.com","jackdough","Jane","Doe","jane.doe@example.com","jane1100",,,,,false,false,false,false,true,false,false,false,false,true,false,false,false,true\r\n2,"Test Project B","Lorem ipsum doler","EMPR","3f4d4b","pending_edit","small","Silver Kamloops",,"Jack","Dough","jack.dough@example.com","jackdough","Jane","Doe","jane.doe@example.com","jane1100","John","Doh","john.doh@example.com","john1100",false,false,false,false,false,false,false,false,false,false,false,false,false,false\r\n1,"Test Project A","Lorem ipsum doler","AEST","6f47f6","pending_approval","small","Silver Kamloops",,"Jack","Dough","jack.dough@example.com","jackdough","Jane","Doe","jane.doe@example.com","jane1100",,,,,true,false,false,true,false,false,false,false,false,false,false,false,false,false';
    expect(transformJsonToCsv(flattenedProfiles)).toEqual(result);
  });
});

describe('test the helper function flatten', () => {
  test('should return correct flattened profile', () => {
    expect(flatten(profiles[0])).toEqual(flattenedProfiles[0]);
  });
});

describe('test the helper function convertSnakeCaseToSentence', () => {
  test('should return correct flattened profile', () => {
    const snakeCaseText = 'pending_approval';
    const sentenceText = 'Pending Approval';
    expect(convertSnakeCaseToSentence(snakeCaseText)).toEqual(sentenceText);
  });
});

describe('test the helper function convertSnakeCaseToSentence', () => {
  test('should return correct flattened profile', () => {
    const clusterName = 'silver';
    const { displayName } = silverCluster[0];
    expect(getClusterDisplayName(clusterName, silverCluster)).toEqual(displayName);
  });
});
