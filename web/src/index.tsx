//
// Copyright © 2020 Province of British Columbia
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,git
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { css, Global } from '@emotion/core';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App';
import * as serviceWorker from './serviceWorker';
import theme from './theme';
import { store, persistor } from './redux/store';
import typography from './typography';

ReactDOM.render(
  <Provider store={store}>
    <React.StrictMode>
      <Global
        styles={css`
          html,
          body {
            ${typography.toString()}
            margin: 0;
            padding: 0;
            min-height: '100vh';
            max-width: '100vw';
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          #root {
          }
          code {
            font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
          }
          .misc-class-m-dropdown-select {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 200px;
          }
          .misc-class-m-dropdown-link {
            text-decoration: none;
            color: ${theme.colors.bcblue};
          }

          .misc-class-m-form-submit-btn:active {
            position: relative;
            top: 1px;
          }
          .componentContextLink a{
            background-color: #96c0e6;
            color: #f8f9fa;
            border-radius: 5px;
            width: 20px;
            text-align: center;
            height: fit-content;
            text-decoration: none;
          },
        `}
      />
      <PersistGate persistor={persistor}>
        <App />,
      </PersistGate>
    </React.StrictMode>
  </Provider>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
