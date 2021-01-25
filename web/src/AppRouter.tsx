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

import { useKeycloak } from '@react-keycloak/web';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Redirect, Router, Switch } from 'react-router-dom';
import { BackdropForProcessing } from './components/common/UI/Backdrop';
import { HOME_PAGE_URL, ROUTE_PATHS } from './constants';
import { AuthLayout, PublicLayout } from './layouts/Layout';
import AppRoute from './utils/AppRoute';
import { areQueryParamsForProfileValid } from './utils/checkQueryParamsHelper';
import Dashboard from './views/Dashboard';
import { NotFound } from './views/NotFound';
import ProfileCreate from './views/ProfileCreate';
import ProfileEdit from './views/ProfileEdit';
import { PublicLanding } from './views/PublicLanding';

const browserHistory = createBrowserHistory();

const AppRouter: React.FC = () => {
  const { initialized } = useKeycloak();

  if (!initialized) {
    return <BackdropForProcessing />;
  }

  return (
    <Router history={browserHistory}>
      <Switch>
        <Redirect exact from="/" to={ROUTE_PATHS.LANDING} />
        <AppRoute path={ROUTE_PATHS.LANDING} component={PublicLanding} layout={PublicLayout} />
        <AppRoute
          exact
          path={ROUTE_PATHS.PROFILE_CREATE}
          component={ProfileCreate}
          layout={AuthLayout}
        />
        <AppRoute exact path={HOME_PAGE_URL} component={Dashboard} layout={AuthLayout} />
        <AppRoute
          exact
          path={ROUTE_PATHS.PROFILE_EDIT}
          component={ProfileEdit}
          layout={AuthLayout}
          checkQueryParams={areQueryParamsForProfileValid}
        />
        <AppRoute path={ROUTE_PATHS.NOT_FOUND} component={NotFound} layout={PublicLayout} />
        <Redirect to={ROUTE_PATHS.NOT_FOUND} />
      </Switch>
    </Router>
  );
};

export default AppRouter;
