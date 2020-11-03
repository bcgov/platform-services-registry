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

interface IProfileCardProps {
  title?: string;
  textBody?: string
  ministry?: string;
  PO?: string;
  TC?: string;
};

const ProfileCard: React.FC<IProfileCardProps> = (props) => {
  const { title = '', textBody = '', ministry = '', PO = '', TC = '' } = props;

  return (
    <Flex
      alignItems="left"
      justifyContent="center"
      flexDirection="column"
    >
      <Text
        as="h2"
        fontSize={[3, 4, 4]}
        fontWeight={500}
        mb={3}
      >
        {title}
      </Text>
      <Text
        as="h2"
        color="darkgrey"
        fontSize={[2, 3, 3]}
        fontWeight={500}
        mb={3}
      >
        {textBody}
      </Text>
      <Text as="p" color="darkgrey" fontSize={[2, 3, 3]} mt={1}>
        {ministry}
      </Text>
      <Text as="p" color="darkgrey" fontSize={[2, 3, 3]} mt={1}>
        Project owner: {PO}
      </Text>
      <Text as="p" color="darkgrey" fontSize={[2, 3, 3]} mt={1}>
        Technical contact: {TC}
      </Text>
    </Flex>
  );
};

export default ProfileCard;