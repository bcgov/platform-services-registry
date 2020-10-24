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
import Layout from './components/Layout';
import { HOME_PAGE_URL, LAYOUT_SET_AUTH, LAYOUT_SET_MIN, LAYOUT_SET_UNAUTH, ROUTE_PATHS } from './constants';
import AppRoute from './utils/AppRoute';
import { Dashboard } from './views/Dashboard';
import form from './views/form';
import { NotFound } from './views/NotFound';
import { PublicLanding } from './views/PublicLanding';

const browserHistory = createBrowserHistory();

const AppRouter: React.FC = () => {
  return (
    <Router history={browserHistory}>
      <Switch>
        <Redirect exact from='/' to={ROUTE_PATHS.LANDING} />
        <AppRoute path={ROUTE_PATHS.LANDING} component={PublicLanding} layout={Layout} layoutName={LAYOUT_SET_UNAUTH} />
        <AppRoute exact path={ROUTE_PATHS.FORM} component={form} layout={Layout} layoutName={LAYOUT_SET_AUTH} />
        <AppRoute exact path={HOME_PAGE_URL} component={Dashboard} layout={Layout} layoutName={LAYOUT_SET_AUTH} />
        <AppRoute path={ROUTE_PATHS.NOT_FOUND} component={NotFound} layout={Layout} layoutName={LAYOUT_SET_MIN} />
        <Redirect to={ROUTE_PATHS.NOT_FOUND} />
      </Switch>
    </Router>
  );
};

export default AppRouter;