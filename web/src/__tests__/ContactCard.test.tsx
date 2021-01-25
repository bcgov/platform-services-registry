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

import { render } from '@testing-library/react';
import React from 'react';
import ContactCard from '../components/profileEdit/ContactCard';

test('matches the snapshot', () => {
  const stubPropPOName = 'Jane Doe';
  const stubPropPOEmail = 'jane@example.com';
  const stubPropTCName = 'Jim Doe';
  const stubPropTCEmail = 'jim@example.com';

  const { container } = render(
    <ContactCard
      contactDetails={{
        POName: stubPropPOName,
        POEmail: stubPropPOEmail,
        TCName: stubPropTCName,
        TCEmail: stubPropTCEmail,
      }}
    />,
  );

  expect(container).toMatchSnapshot();
});
