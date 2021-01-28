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
import theme from '../../theme';

interface IContactCardProps {
  contactDetails: ContactDetails;
}

export interface ContactDetails {
  POId?: string;
  POFirstName?: string;
  POLastName?: string;
  POName?: string;
  POEmail?: string;
  POGithubId?: string;
  TCId?: string;
  TCFirstName?: string;
  TCLastName?: string;
  TCName?: string;
  TCEmail?: string;
  TCGithubId?: string;
}

const ContactCard: React.FC<IContactCardProps> = (props) => {
  const {
    contactDetails: {
      POName = '',
      POEmail = '',
      POGithubId = '',
      TCName = '',
      TCEmail = '',
      TCGithubId = '',
    },
  } = props;

  return (
    <Flex flexWrap="wrap">
      <Box width={1 / 2} px={2} mt={3}>
        <Text as="h3">Product Owner</Text>
        <Text as="p" color={theme.colors.grey} fontSize={[1, 2, 2]} mt={1}>
          This is typically the business owner of the application;
        </Text>
      </Box>
      <Box width={1 / 2} px={2} mt={3}>
        <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
          {POName}
        </Text>
        <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
          {POEmail}
        </Text>
        <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
          {POGithubId}
        </Text>
      </Box>
      <Box width={1 / 2} px={2} mt={3}>
        <Text as="h3">Technical Contact</Text>
        <Text as="p" color={theme.colors.grey} fontSize={[1, 2, 2]} mt={1}>
          This is typically the DevOps specialist;
        </Text>
      </Box>
      <Box width={1 / 2} px={2} mt={3}>
        <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
          {TCName}
        </Text>
        <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
          {TCEmail}
        </Text>
        <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
          {TCGithubId}
        </Text>
      </Box>
    </Flex>
  );
};

export default ContactCard;
