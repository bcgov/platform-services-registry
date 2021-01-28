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

import { useKeycloak } from '@react-keycloak/web';
import React from 'react';
import { Route, RouteProps } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

interface IAppRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  layout: React.ComponentType<any>;
  checkQueryParams?: (props: any) => boolean;
}

const AppRoute: React.FC<IAppRouteProps> = (props) => {
  const { component: Component, layout: Layout, checkQueryParams, ...rest } = props;

  const { keycloak } = useKeycloak();

  const usePrivateRoute: boolean = !!(keycloak && keycloak.authenticated);

  if (usePrivateRoute) {
    return (
      <PrivateRoute
        component={Component}
        layout={Layout}
        {...rest}
        checkQueryParams={checkQueryParams}
      />
    );
  }
  return (
    <Route
      {...rest}
      render={(routeProps) => (
        <Layout>
          <Component {...routeProps} />
        </Layout>
      )}
    />
  );
};

export default AppRoute;
