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

import { DROPDOWN_CLASSNAME } from '../constants';

export default () => {
  const dropdowns = document.querySelectorAll("div[id^='Dropdown']");

  if (dropdowns) {
    let i;
    for (i = 0; i < dropdowns.length; i++) {
      let openDropdown = dropdowns[i];
      if (openDropdown.classList.contains(DROPDOWN_CLASSNAME)) {
        openDropdown.classList.remove(DROPDOWN_CLASSNAME);
      }
    }
  }
}