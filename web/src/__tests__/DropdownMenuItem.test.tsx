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

import { fireEvent, render } from '@testing-library/react';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import DropdownMenuItem from '../components/DropdownMenuItem';

const browserHistory = createBrowserHistory();

test('renders dropdown menu item with react route path - incoming query', () => {
  const stubPropHref = '/some-path';
  const stubPropTitle = 'some title';
  const stubPropSubTitle = 'some sub title';

  const { getByText } = render(
    <Router history={browserHistory} >
      <DropdownMenuItem
        href={stubPropHref}
        title={stubPropTitle}
        subTitle={stubPropSubTitle}
      />
    </Router>
  );
  const routeText = getByText(stubPropTitle);

  expect(routeText).toBeInTheDocument();
  expect(routeText.closest('a')).toHaveAttribute('href', stubPropHref);
});

function renderDropdownMenuItem() {
  const stubPropCB = jest.fn();
  const stubPropTitle = 'some title';
  const stubPropSubTitle = 'some sub title';

  const utils = render(
    <Router history={browserHistory} >
      <DropdownMenuItem
        title={stubPropTitle}
        subTitle={stubPropSubTitle}
        onClickCB={stubPropCB}
      />
    </Router>
  );

  const routeText = utils.getByText(stubPropTitle);
  return { ...utils, routeText, stubPropCB };
}

test('renders dropdown menu item without react route path - incoming query', () => {
  const { routeText } = renderDropdownMenuItem();

  expect(routeText).toBeInTheDocument();
});

test('dropdown menu item without react route path - outgoing command', () => {
  const { routeText, stubPropCB } = renderDropdownMenuItem();
  fireEvent.click(routeText);

  expect(stubPropCB.mock.calls.length).toBe(1);
});