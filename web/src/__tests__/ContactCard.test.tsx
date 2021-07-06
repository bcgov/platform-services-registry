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
import { ROLES } from '../constants';

test('matches the snapshot', () => {
  const stubPropPOId = '1';
  const stubPropPOFirstName = 'Jane';
  const stubPropPOLastName = 'Doe';
  const stubPropPOEmail = 'jane@example.com';
  const stubPropPORole = ROLES.PRODUCT_OWNER;
  const stubPropTLId = '2';
  const stubPropTLFirstName = 'Jim';
  const stubPropTLLastName = 'Doe';
  const stubPropTLEmail = 'jim@example.com';
  const stubPropTLRole = ROLES.TECHNICAL_LEAD;

  const { container } = render(
    <ContactCard
      contactDetails={[{
        id: stubPropPOId,
        firstName: stubPropPOFirstName,
        lastName: stubPropPOLastName,
        email: stubPropPOEmail,
        roleId: stubPropPORole,
      },{
        id: stubPropTLId,
        firstName: stubPropTLFirstName,
        lastName: stubPropTLLastName,
        email: stubPropTLEmail,
        roleId: stubPropTLRole,
      }]}
    />,
  );

  expect(container).toMatchSnapshot();
});
