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
import { Flex, Text } from 'rebass';

export const CreateFormGoldModal: React.FC<any> = (props) => {
  return (
    <>
      <Flex flexDirection="column">
        <Text as="h3" mt={3}>
          Gold / Gold DR Information
        </Text>
        <Text as="p" mt={3}>
          All project sets provisioned in Gold Kamloops cluster will automatically get an identical
          project set provisioned in the Gold Calgary for the purpose of setting up a geographic
          failover for the app.
        </Text>
        <Text as="p" my={3}>
          The link to the Openshift Consoles for Gold Kamloops and Gold Calgary will be included in
          the confirmation email that will be sent out once provisioning of both project sets is
          complete
        </Text>
      </Flex>
    </>
  );
};
