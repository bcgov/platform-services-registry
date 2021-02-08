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

import React from 'react';
import getValidator from '../../utils/getValidator';
import FormSubtitle from '../common/UI/FormSubtitle';
import FormTitle from '../common/UI/FormTitle';

const CreateFormMigration: React.FC = () => {
  const validator = getValidator();

  return (
    <div>
      <FormTitle>Tell us about your project</FormTitle>
      <FormSubtitle>
        As the capacity in the Silver cluster remains to be an issue due to the slow progress of the
        app migration, the priority will be given to provisioning namespaces for the projects that:
        <blockquote>
          <br /> a) migrate from OCP3 and
          <br /> b) have short 2-3 week migration timelines starting from when the namespaces are
          provisioned.
        </blockquote>
        Please indicate in the project description field if your project meets the two criteria
        above and include the license plate number for the OCP3 project set.
      </FormSubtitle>
    </div>
  );
};

export default CreateFormMigration;
