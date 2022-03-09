//
// Copyright © 2020 Province of British Columbia
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
// Created by Jason Leach on 2020-06-05.
//

export const SSO_BASE_URL =
  process.env.NODE_ENV === 'production' ? '{{env "SSO_BASE_URL"}}' : 'https://dev.oidc.gov.bc.ca';
export const SSO_CLIENT_ID = 'registry-web';
export const SSO_REALM_NAME = 'devhub';

export const API = {
  BASE_URL: () =>
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:8100/api/v1/'
      : `${window.location.origin}/api/v1/`,
};

export const ROLES = {
  PRODUCT_OWNER: 1,
  TECHNICAL_LEAD: 2,
  ADMINISTRATOR: 'administrator',
};

export const DEFAULT_MINISTRY = 'CITZ';
export const DEFAULT_GITHUB_ORGANIZATION = ['bcgov', 'BCDevOps'];
export const CREATE_COMMUNITY_ISSUE_URL =
  'https://github.com/bcgov/platform-services-registry/issues/new?&labels=community&template=platform-experience-general-issue.md';

export const COMPONENT_METADATA = [
  { displayName: 'Notification: Email', inputValue: 'notificationEmail' },
  { displayName: 'Notification: SMS', inputValue: 'notificationSms' },
  { displayName: 'Notification: MS Teams', inputValue: 'notificationMsTeams' },
  { displayName: 'Payment processing: Bambora', inputValue: 'paymentBambora' },
  { displayName: 'Payment processing: PayBC', inputValue: 'paymentPayBc' },
  { displayName: 'File Transfer', inputValue: 'fileTransfer' },
  { displayName: 'File Storage', inputValue: 'fileStorage' },
  { displayName: 'Geo Mapping: Web-based', inputValue: 'geoMappingWeb' },
  { displayName: 'Geo Mapping: Location Services', inputValue: 'geoMappingLocation' },
  { displayName: 'Scheduling: Calendar', inputValue: 'schedulingCalendar' },
  { displayName: 'Scheduling: Appointments', inputValue: 'schedulingAppointments' },
  { displayName: 'Identity Management: SiteMinder', inputValue: 'idmSiteMinder' },
  { displayName: 'Identity Management: KeyCloak', inputValue: 'idmKeycloak' },
  { displayName: 'Identity Management: Active Directory', inputValue: 'idmActiveDir' },
];

export const CSV_PROFILE_ATTRIBUTES = [
  'id',
  'name',
  'description',
  'busOrgId',
  'namespacePrefix',
  'profileStatus',
  'quotaSize',
  'clusters.0',
  'clusters.1',
  'productOwners.0.firstName',
  'productOwners.0.lastName',
  'productOwners.0.email',
  'productOwners.0.githubId',
  'technicalLeads.0.firstName',
  'technicalLeads.0.lastName',
  'technicalLeads.0.email',
  'technicalLeads.0.githubId',
  'technicalLeads.1.firstName',
  'technicalLeads.1.lastName',
  'technicalLeads.1.email',
  'technicalLeads.1.githubId',
  'profileMetadata.notificationEmail',
  'profileMetadata.notificationSMS',
  'profileMetadata.notificationMSTeams',
  'profileMetadata.paymentBambora',
  'profileMetadata.paymentPayBC',
  'profileMetadata.fileTransfer',
  'profileMetadata.fileStorage',
  'profileMetadata.geoMappingWeb',
  'profileMetadata.geoMappingLocation',
  'profileMetadata.schedulingCalendar',
  'profileMetadata.schedulingAppointments',
  'profileMetadata.identityManagementSiteMinder',
  'profileMetadata.identityManagementKeycloak',
  'profileMetadata.identityManagementActiveDir',
];

export const CSV_PROFILE_ATTRIBUTES_HEADER = [
  'id',
  'name',
  'description',
  'ministry',
  'namespacePrefix',
  'profileStatus',
  'quotaSize',
  'clusters.0',
  'clusters.1',
  'productOwners.0.firstName',
  'productOwners.0.lastName',
  'productOwners.0.email',
  'productOwners.0.githubId',
  'technicalLeads.0.firstName',
  'technicalLeads.0.lastName',
  'technicalLeads.0.email',
  'technicalLeads.0.githubId',
  'technicalLeads.1.firstName',
  'technicalLeads.1.lastName',
  'technicalLeads.1.email',
  'technicalLeads.1.githubId',
  'profileMetadata.notificationEmail',
  'profileMetadata.notificationSMS',
  'profileMetadata.notificationMSTeams',
  'profileMetadata.paymentBambora',
  'profileMetadata.paymentPayBC',
  'profileMetadata.fileTransfer',
  'profileMetadata.fileStorage',
  'profileMetadata.geoMappingWeb',
  'profileMetadata.geoMappingLocation',
  'profileMetadata.schedulingCalendar',
  'profileMetadata.schedulingAppointments',
  'profileMetadata.identityManagementSiteMinder',
  'profileMetadata.identityManagementKeycloak',
  'profileMetadata.identityManagementActiveDir',
];

export const ROUTE_PATHS = {
  NOT_FOUND: '/page-not-found',
  LANDING: '/public-landing',
  DASHBOARD: '/dashboard',
  PROFILE_CREATE: '/profile/create',
  PROFILE_EDIT: '/profile/:profileId/:viewName',
  ERROR_PAGE: '/errorpage',
};

export const HOME_PAGE_URL = ROUTE_PATHS.DASHBOARD;

export const PROFILE_EDIT_VIEW_NAMES = {
  OVERVIEW: 'overview',
  PROJECT: 'project',
  CONTACT: 'contact',
  QUOTA: 'quota',
};

export const RESPONSE_STATUS_CODE = {
  UNAUTHORIZED: 401,
};

export const MINIMUM_TECHNICAL_LEADS = 1;
export const MAXIMUM_TECHNICAL_LEADS = 2;

export const PRODUCT_OWNER_SUBTITLE = 'This is typically the business owner of the application;';
export const TECHNICAL_LEAD_SUBTITLE = 'This is typically the DevOps specialist;';
