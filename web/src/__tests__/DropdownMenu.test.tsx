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
import DropdownMenu from '../components/common/UI/DropdownMenu';

jest.mock(
  '../components/common/UI/DropdownMenuItem',
  () =>
    function DummyDropdownMenuItem() {
      return <div data-testid="dropdown-menu-item" />;
    },
);

test('renders dropdown menu - incoming query', () => {
  const stubMenuItems = [
    {
      title: 'some title',
      subTitle: 'some sub title',
      href: '/some-path',
      onClickCB: () => {
        // this is intentional (required by Sonarcloud)
      },
    },
  ];

  const { queryAllByTestId } = render(
    <DropdownMenu menuItems={stubMenuItems} handleOnClick={jest.fn()} />,
  );
  const children = queryAllByTestId('dropdown-menu-item');

  expect(children.length).toBe(1);
});
