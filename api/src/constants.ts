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

export const ENVIRONMENTS = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
};

export const PROJECT_SET_NAMES = ["tools", "dev", "test", "prod"];

export const ROLE_IDS = {
  PRODUCT_OWNER: 1,
  TECHNICAL_CONTACT: 2,
};

export const USER_ROLES = {
  ADMINISTRATOR: "administrator",
};

export const WEB_CLIENT_ID = "registry-web";
export const API_CLIENT_ID = "registry-api";
export const BOT_CLIENT_ID = "registry-gitops-ci";

export const STATUS_ERROR = {};
STATUS_ERROR[401] = "Unauthorized";
STATUS_ERROR[500] = "Internal Server Error";

export const CLUSTER_NAMES = ["silver", "gold", "golddr", "klab", "clab"];

export const GOLD_QUORUM_COUNT = 2;

export const BC_ORGNAZTION_GIT_APP_ID = 131752;

export const PROFILE_STATUS = {
  PENDING_APPROVAL: "pending_approval",
  APPROVED: "approved",
  PENDING_EDIT: "pending_edit",
  PROVISIONED: "provisioned",
};

export const DEFAULT_GITHUB_ORGANIZATION = ["bcgov", "BCDevOps"];

export const DEFAULT_NAMESPACE_INITIAL_VALUE = {
  quotaCpuSize: "cpu-request-0.5-limit-1.5",
  quotaMemorySize: "memory-request-2-limit-4",
  quotaStorageSize: "storage-1",
  quotaSnapshotSize: "snapshot-5",
};
