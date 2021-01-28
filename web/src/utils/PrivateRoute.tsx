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
import { Redirect, Route, RouteProps, useLocation } from 'react-router-dom';
import { ROUTE_PATHS } from '../constants';
import { AuthLayout } from '../layouts/Layout';

interface IPrivateRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  componentProps?: any;
  checkQueryParams?: (props: any) => boolean;
}

const PrivateRoute: React.FC<IPrivateRouteProps> = (props) => {
  let { component: Component, checkQueryParams, ...rest } = props;

  const { keycloak } = useKeycloak();
  const location = useLocation();

  if (!keycloak) {
    return null;
  }

  return (
    <Route
      {...rest}
      render={(routeProps) => {
        if (checkQueryParams && !checkQueryParams(routeProps)) {
          return <Redirect to={ROUTE_PATHS.NOT_FOUND} />;
        }
        if (keycloak.authenticated) {
          return (
            <AuthLayout {...rest}>
              <Component {...props} {...rest.componentProps} />
            </AuthLayout>
          );
        }
        if (routeProps.location.pathname !== ROUTE_PATHS.LANDING) {
          const redirectTo = encodeURI(`${location.pathname}${location.search}`);
          return <Redirect to={`${ROUTE_PATHS.LANDING}?redirect=${redirectTo}`} />;
        }
      }}
    />
  );
};

export default PrivateRoute;
