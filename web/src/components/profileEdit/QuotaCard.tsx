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
import { Link as RouterLink } from 'react-router-dom';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import Aux from '../../hoc/auxillary';
import theme from '../../theme';
import {
  ProjectSetResourceQuotaSize,
  NamespaceQuotaOption,
  ProjectNamespaceResourceQuotaSize,
} from '../../types';
import { BaseIcon } from '../common/UI/Icon';

interface IQuotaCardProps {
  quotaDetails: QuotaDetails;
  href: string;
}

export interface QuotaDetails {
  licensePlate?: string;
  quotaSize: ProjectSetResourceQuotaSize;
  quotaOptions: NamespaceQuotaOption;
  primaryClusterName?: string;
}

interface SpecTextInterface {
  CPU: string;
  Memory: string;
  [key: string]: string;
}

export const NAMESPACE_DEFAULT_QUOTA: ProjectNamespaceResourceQuotaSize = {
  quotaCpuSize: '',
  quotaMemorySize: '',
  quotaStorageSize: '',
  quotaSnapshotSize: '',
};

const QuotaCard: React.FC<IQuotaCardProps> = (props) => {
  const {
    quotaDetails: {
      licensePlate = '',
      quotaSize = {
        dev: NAMESPACE_DEFAULT_QUOTA,
        test: NAMESPACE_DEFAULT_QUOTA,
        tools: NAMESPACE_DEFAULT_QUOTA,
        prod: NAMESPACE_DEFAULT_QUOTA,
      },
      primaryClusterName = '',
    },
    href,
  } = props;
  const NAMESPACE_TEXT = [
    {
      displayName: 'Production',
      shortName: 'prod',
      goldURL: process.env.PRODUCTION_NAMESPACE_GOLD_URL as string,
      silverURL: process.env.PRODUCTION_NAMESPACE_SILVER_URL as string,
    },
    {
      displayName: 'Test',
      shortName: 'test',
      goldURL: process.env.TEST_NAMESPACE_GOLD_URL as string,
      silverURL: process.env.TEST_NAMESPACE_SILVER_URL as string,
    },
    {
      displayName: 'Development',
      shortName: 'dev',
      goldURL: process.env.DEVELOPMENT_NAMESPACE_GOLD_URL as string,
      silverURL: process.env.DEVELOPMENT_NAMESPACE_SILVER_URL as string,
    },
    {
      displayName: 'Tools',
      shortName: 'tools',
      goldURL: process.env.TOOLS_NAMESPACE_GOLD_URL as string,
      silverURL: process.env.TOOLS_NAMESPACE_SILVER_URL as string,
    },
  ];

  return (
    <Flex flexWrap="wrap">
      {NAMESPACE_TEXT.map((namespaceText: { displayName: string; shortName: string; goldURL: string; silverURL: string }) => {
        const index = namespaceText.shortName as keyof typeof quotaSize;
        const url = primaryClusterName === 'gold' ? namespaceText.goldURL  : namespaceText.silverURL ;
        console.log('primary cluster name: ' + primaryClusterName);
        const namespaceFullName = `${licensePlate}-${namespaceText.shortName}`;
        return (
          <Aux key={namespaceText.displayName}>
            <Box width={1 / 2} px={2} mt={3}>
              <Flex>
                <Text as="h3" marginRight={2}>
                  {namespaceText.displayName} Namespace
                </Text>
                <RouterLink
                  className="misc-class-m-dropdown-link"
                  to={`${href}?namespace=${namespaceFullName}`}
                >
                  <BaseIcon
                    name="edit"
                    color="primary"
                    hover
                    width={1.5}
                    height={1.5}
                    displayIcon={faPen}
                  />
                </RouterLink>
              </Flex>
              <Text as="p" color={theme.colors.grey} fontSize={[1, 2, 2]} mt={1}>
                {url}
                {`${namespaceFullName} namespace`}
              </Text>
            </Box>
            <Box width={1 / 2} px={2} mt={3}>
              <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
                CPU:{quotaSize[index].quotaCpuSize}
              </Text>
              <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
                Memory:{quotaSize[index].quotaMemorySize}
              </Text>
              <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
                Storage:{quotaSize[index].quotaStorageSize}
              </Text>
              <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
                Snapshot:{quotaSize[index].quotaSnapshotSize}
              </Text>
            </Box>
          </Aux>
        );
      })}
    </Flex>
  );
};

export default QuotaCard;
