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
import ProjectCard from '../components/profileEdit/ProjectCard';

test('<ProjectCard /> should render without Migration Licenseplate', () => {
  const stubPropTitle = 'Health Gateway';
  const stubPropTextBody = 'This is a test description for health gateway app';
  const stubPropMinistry = "Citizen's Services";

  const { container } = render(
    <ProjectCard
      projectDetails={{
        name: stubPropTitle,
        description: stubPropTextBody,
        ministryName: stubPropMinistry,
      }}
    />,
  );

  expect(container).toMatchSnapshot();
});

test('<ProjectCard /> should render with Migration Licenseplate', () => {
  const stubPropTitle = 'Health Gateway';
  const stubPropTextBody = 'This is a test description for health gateway app';
  const stubPropMinistry = "Citizen's Services";
  const stubPropMigrationLicensePlate = 'abcdef';

  const { container } = render(
    <ProjectCard
      projectDetails={{
        name: stubPropTitle,
        description: stubPropTextBody,
        ministryName: stubPropMinistry,
        migratingLicenseplate: stubPropMigrationLicensePlate,
      }}
    />,
  );

  expect(container).toMatchSnapshot();
});
