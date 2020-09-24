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
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { createBrowserHistory } from 'history';
import React from 'react';
import { Redirect, Router, Switch } from 'react-router-dom';
import AppRoute from '../hoc/AppRoute';
import form from './form';
import Auth from './layouts/Auth';
import Min from './layouts/Min';
import Unauth from './layouts/Unauth';
import { NotFound } from './views/NotFound';
import { PublicLanding } from './views/PublicLanding';

const browserHistory = createBrowserHistory();

const AppRouter: React.FC = () => {
  return (
    <Router history={browserHistory}>
      <Switch>
        <Redirect exact from='/' to='/public-landing' />
        <AppRoute path='/public-landing' component={PublicLanding} layout={Unauth} />
        <AppRoute protected path='/namespaces' component={form} layout={Auth} />
        <AppRoute protected path='/namespaces/create-new-namespace' component={form} layout={Auth} />
        <AppRoute path='/page-not-found' component={NotFound} layout={Min} />
        <Redirect to='/page-not-found' />
      </Switch>
    </Router>
  );
};

export default AppRouter;