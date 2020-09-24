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

import React from 'react';
import { Route, RouteProps } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

export type IAppRouteProps = RouteProps & {
  protected?: boolean;
  component: React.ComponentType<any>;
  layout?: React.ComponentType<any>;
};

const AppRoute: React.FC<IAppRouteProps> = ({
  protected: usePrivateRoute,
  component: Component,
  layout,
  ...rest
}) => {
  const Layout = layout === undefined ? (props: any) => <>{props.children}</> : layout;

  if (!!usePrivateRoute) {
    return <PrivateRoute {...rest} component={Component} layout={Layout} />;
  }

  return (
    <Route
      {...rest}
      render={(props) => (
        <Layout>
          <Component {...props} />
        </Layout>
      )}
    />
  );
};

export default AppRoute;

