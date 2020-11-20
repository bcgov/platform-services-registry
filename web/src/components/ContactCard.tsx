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
import { Box, Flex, Text } from 'rebass';
import theme from '../theme';

interface IContactCardProps {
  POName?: string;
  POEmail?: string;
  TCName?: string;
  TCEmail?: string;
};

const ContactCard: React.FC<IContactCardProps> = (props) => {
  const { POName = '', POEmail = '', TCName = '', TCEmail = '' } = props;

  return (
    <Flex flexWrap='wrap'>
        <Box width={1/2} px={2}>
            <Text as="h3" mt={4}>
                Product Owner:
            </Text>
        </Box>
        <Box width={1/2} px={2}> 
            <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={2}>
                {POName}
            </Text>
            <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={2}>
                {POEmail}
            </Text>
        </Box>
        <Box width={1/2} px={2}>
            <Text as="h3" mt={4}>
                Technical Contact:
            </Text>
        </Box>
        <Box width={1/2} px={2}> 
            <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={2}>
                {TCName}
            </Text>
            <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={2}>
                {TCEmail}
            </Text>
        </Box>
    </Flex>
  );
};

export default ContactCard;