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
import Aux from '../../hoc/auxillary';
import theme from '../../theme';
import { ProjectResourceQuotaSize, QuotaSize } from '../../types';

interface IQuotaCardProps {
  quotaDetails: QuotaDetails;
}

export interface QuotaDetails {
  licensePlate?: string;
  quotaSize?: ProjectResourceQuotaSize;
  quotaOptions?: {
    quotaCpuSize: QuotaSize[];
    quotaMemorySize: QuotaSize[];
    quotaStorageSize: QuotaSize[];
  };
}
interface SpecTextInterface {
  CPU: string;
  Memory: string;
  [key: string]: string;
}

const QuotaCard: React.FC<IQuotaCardProps> = (props) => {
  const {
    quotaDetails: {
      licensePlate = '',
      quotaSize = { quotaCpuSize: '', quotaMemorySize: '', quotaStorageSize: '' },
    },
  } = props;

  const namespaceTexts = [
    ['Production', 'prod'],
    ['Test', 'test'],
    ['Development', 'dev'],
    ['Tools', 'tools'],
  ];
  const specTexts: SpecTextInterface = {
    CPU: quotaSize?.quotaCpuSize,
    Memory: quotaSize?.quotaMemorySize,
    Storage: quotaSize?.quotaStorageSize,
  };

  return (
    <Flex flexWrap="wrap">
      {namespaceTexts.map((namespaceText: string[], index0: number) => (
        <Aux key={index0}>
          <Box width={1 / 2} px={2} mt={3}>
            <Text as="h3">{namespaceText[0]} Namespace</Text>
            <Text as="p" color={theme.colors.grey} fontSize={[1, 2, 2]} mt={1}>
              {`${licensePlate}-${namespaceText[1]} namespace`}
            </Text>
          </Box>
          <Box width={1 / 2} px={2} mt={3}>

            <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
              CPU:{specTexts.CPU}
            </Text>
            <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
              Memory:{specTexts.Memory}
            </Text>
            <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
              Storage:{specTexts.Storage}
            </Text>

          </Box>
        </Aux>
      ))}
    </Flex>
  );
};

export default QuotaCard;
