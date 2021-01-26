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

import { PROFILE_EDIT_VIEW_NAMES } from '../constants';

export function areQueryParamsForProfileValid(props: any) {
  const {
    match: {
      params: { profileId, viewName },
    },
  } = props;

  const { OVERVIEW, PROJECT, CONTACT, QUOTA } = PROFILE_EDIT_VIEW_NAMES;
  if (![OVERVIEW, PROJECT, CONTACT, QUOTA].includes(viewName)) {
    return false;
  }
  try {
    const id = parseInt(profileId, 10);
    return id >= 1;
  } catch (err) {
    return false;
  }
}
