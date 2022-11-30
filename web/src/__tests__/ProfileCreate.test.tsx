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

import { act } from "react-dom/test-utils";
// import { create } from "react-test-renderer";
import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import ProfileCreate from '../views/ProfileCreate';
import { MsalReactTester } from 'msal-react-tester';
import { MsalProvider } from '@azure/msal-react';

jest.mock(
  '../utils/getDecodedToken',
  () =>
    function getDecodedToken() {
      return {
        email: 'test@example.com',
        family_name: 'Jane',
        given_name: 'Doe',
        name: 'Jane Doe',
        preferred_username: 'janedoe@idir',
      };
    },
);

test('matches the snapshot', async() => {
  const stubPropCB = jest.fn();
  const msalTester = new MsalReactTester(); 
  msalTester.spyMsal();
  let container;
  msalTester.isNotLogged();

      // container = create(
      //   <MsalProvider instance={msalTester.client}>
      //     <Provider store={store}>
      //       <ProfileCreate openBackdropCB={stubPropCB} closeBackdropCB={stubPropCB} container />,
      //     </Provider>,
      //   </MsalProvider>
      // );

 // expect(container).toMatchSnapshot();
  msalTester.resetSpyMsal();
});
