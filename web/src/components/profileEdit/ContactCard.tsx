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
import { PRODUCT_OWNER_SUBTITLE, ROLES, TECHNICAL_LEAD_SUBTITLE } from '../../constants';
import theme from '../../theme';

interface IContactCardProps {
  contactDetails: ContactDetails[];
}

export interface ContactDetails {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  githubId?: string;
  roleId?: number;
}

const ContactCard: React.FC<IContactCardProps> = (props) => {
  const { contactDetails } = props;
  return (
    <Flex flexDirection="column">
      {contactDetails.map((contact: any) => (
        <Flex key={contact.id} flexWrap="wrap">
          <Box width={1 / 2} px={2} mt={3}>
            <Text as="h3">
              {contact.roleId === ROLES.PRODUCT_OWNER ? 'Product Owner' : ' Technical Lead'}
            </Text>
            <Text as="p" color={theme.colors.grey} fontSize={[1, 2, 2]} mt={1}>
              {contact.roleId === ROLES.PRODUCT_OWNER
                ? PRODUCT_OWNER_SUBTITLE
                : TECHNICAL_LEAD_SUBTITLE}
            </Text>
          </Box>
          <Box width={1 / 2} px={2} mt={3}>
            <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
              {`${contact.firstName} ${contact.lastName}`}
            </Text>
            <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
              {contact.email}
            </Text>
            <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
              {contact.githubId}
            </Text>
          </Box>
        </Flex>
      ))}
    </Flex>
  );
};

export default ContactCard;
