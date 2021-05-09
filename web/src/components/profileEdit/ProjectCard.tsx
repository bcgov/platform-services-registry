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

interface IProjectCardProps {
  projectDetails: ProjectDetails;
}

export interface ProjectDetails {
  id?: string;
  name?: string;
  description?: string;
  prioritySystem?: string;
  busOrgId?: string;
  ministryName?: string;
  primaryClusterDisplayName?: string;
  other?: string;
  migratingLicenseplate?: string;
}

const ProjectCard: React.FC<IProjectCardProps> = (props) => {
  const {
    projectDetails: {
      name = '',
      description = '',
      ministryName = '',
      migratingLicenseplate = '',
      primaryClusterDisplayName = '',
    },
  } = props;
  return (
    <Flex flexWrap="wrap">
      <Box width={1 / 2} px={2} mt={3}>
        <Text as="h3">Project Name</Text>
        <Text as="p" color={theme.colors.grey} fontSize={[1, 2, 2]} mt={1}>
          This is the public name of the application, please avoid acronyms;
        </Text>
      </Box>
      <Box width={1 / 2} px={2} mt={3}>
        <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
          {name}
        </Text>
      </Box>
      <Box width={1 / 2} px={2} mt={3}>
        <Text as="h3">Project Description</Text>
        <Text as="p" color={theme.colors.grey} fontSize={[1, 2, 2]} mt={1}>
          This is a brief description of your project;
        </Text>
      </Box>
      <Box width={1 / 2} px={2} mt={3}>
        <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
          {description}
        </Text>
      </Box>
      <Box width={1 / 2} px={2} mt={3}>
        <Text as="h3">Ministry</Text>
        <Text as="p" color={theme.colors.grey} fontSize={[1, 2, 2]} mt={1}>
          This is the ministry that is responsible for your application;
        </Text>
      </Box>
      <Box width={1 / 2} px={2} mt={3}>
        <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
          {ministryName}
        </Text>
      </Box>
      <Box width={1 / 2} px={2} mt={3}>
        <Text as="h3">Cluster</Text>
        <Text as="p" color={theme.colors.grey} fontSize={[1, 2, 2]} mt={1}>
          This is the cluster this namespace is provisioned in;
        </Text>
      </Box>
      <Box width={1 / 2} px={2} mt={3}>
        <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
          {primaryClusterDisplayName}
        </Text>
      </Box>
      {migratingLicenseplate ? (
        <Flex width={1}>
          <Box width={1 / 2} px={2} mt={3}>
            <Text as="h3">Migrating Application</Text>
            <Text as="p" color={theme.colors.grey} fontSize={[1, 2, 2]} mt={1}>
              This is the license plate of your migrating OCP 3.11 application;
            </Text>
          </Box>
          <Box width={1 / 2} px={2} mt={3}>
            <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
              {migratingLicenseplate}
            </Text>
          </Box>
        </Flex>
      ) : (
        <Flex />
      )}
    </Flex>
  );
};

export default ProjectCard;
