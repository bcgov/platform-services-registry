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

export const SSO_BASE_URL = process.env.NODE_ENV === 'production'
  ? '{{env "SSO_BASE_URL"}}'
  : 'https://sso-dev.pathfinder.gov.bc.ca';
export const SSO_CLIENT_ID = 'registry-web';
export const SSO_REALM_NAME = 'devhub';

export const API = {
  BASE_URL: () =>
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:8100/api/v1/'
      : `${window.location.origin}/api/v1/`,
};

export const ROLES = {
  PRODUCTOWNER: 1,
  TECHNICAL: 2,
};

export const DEFAULT_MINISTRY = 'CITZ';

export const LAYOUT_SET_MIN = 'min';
export const LAYOUT_SET_AUTH = 'auth';
export const LAYOUT_SET_UNAUTH = 'unauth';

export const COMPONENT_METADATA = [
  { displayName: 'Notification: Email', inputValue: 'notificationEmail' },
  { displayName: 'Notification: SMS', inputValue: 'notificationSMS' },
  { displayName: 'Notification: MS Teams', inputValue: 'notificationMSTeams' },
  { displayName: 'Payment processing: Bambora', inputValue: 'paymentBambora' },
  { displayName: 'Payment processing: PayBC', inputValue: 'paymentPayBC' },
  { displayName: 'File Transfer', inputValue: 'fileTransfer' },
  { displayName: 'File Storage', inputValue: 'fileStorage' },
  { displayName: 'Geo Mapping: Web-based', inputValue: 'geoMappingWeb' },
  { displayName: 'Geo Mapping: Location Services', inputValue: 'geoMappingLocation' },
  { displayName: 'Scheduling: Calendar', inputValue: 'schedulingCalendar' },
  { displayName: 'Scheduling: Appointments', inputValue: 'schedulingAppointments' },
  { displayName: 'Identity Management: SiteMinder', inputValue: 'identityManagementSiteMinder' },
  { displayName: 'Identity Management: KeyCloak', inputValue: 'identityManagementKeyCloak' },
  { displayName: 'Identity Management: Active Directory', inputValue: 'identityManagementActiveDir' }
]