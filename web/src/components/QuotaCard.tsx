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

interface IQuotaCardProps {
    licensePlate: string;
    quotaSize: string
};

const QuotaCard: React.FC<IQuotaCardProps> = (props) => {
    const { licensePlate, quotaSize } = props;

    return (
        <Flex flexWrap='wrap'>
            <Box width={1 / 2} px={2} mt={3}>
                <Text as="h3">
                    Production Namespace
            </Text>
                <Text as="p" color={theme.colors.grey} fontSize={[1, 2, 2]} mt={1}>
                    {`${licensePlate}-prod namespace in Silver cluster`}
                </Text>
            </Box>
            <Box width={1 / 2} px={2} mt={3}>
                <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
                    CPU: {quotaSize}
                </Text>
                <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
                    Memory: {quotaSize}
                </Text>
                <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
                    Storage: {quotaSize}
                </Text>
            </Box>
            <Box width={1 / 2} px={2} mt={3}>
                <Text as="h3">
                    Test Namespace
            </Text>
                <Text as="p" color={theme.colors.grey} fontSize={[1, 2, 2]} mt={1}>
                    {`${licensePlate}-test namespace in Silver cluster`}
                </Text>
            </Box>
            <Box width={1 / 2} px={2} mt={3}>
                <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
                    CPU: {quotaSize}
                </Text>
                <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
                    Memory: {quotaSize}
                </Text>
                <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
                    Storage: {quotaSize}
                </Text>
            </Box>
            <Box width={1 / 2} px={2} mt={3}>
                <Text as="h3">
                    Development Namespace
            </Text>
                <Text as="p" color={theme.colors.grey} fontSize={[1, 2, 2]} mt={1}>
                    {`${licensePlate}-dev namespace in Silver cluster`}
                </Text>
            </Box>
            <Box width={1 / 2} px={2} mt={3}>
                <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
                    CPU: {quotaSize}
                </Text>
                <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
                    Memory: {quotaSize}
                </Text>
                <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
                    Storage: {quotaSize}
                </Text>
            </Box>
            <Box width={1 / 2} px={2} mt={3}>
                <Text as="h3">
                    Tools Namespace
            </Text>
                <Text as="p" color={theme.colors.grey} fontSize={[1, 2, 2]} mt={1}>
                    {`${licensePlate}-tools namespace in Silver cluster`}
                </Text>
            </Box>
            <Box width={1 / 2} px={2} mt={3}>
                <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
                    CPU: {quotaSize}
                </Text>
                <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
                    Memory: {quotaSize}
                </Text>
                <Text as="p" color={theme.colors.grey} fontSize={[2, 3, 3]} mt={1}>
                    Storage: {quotaSize}
                </Text>
            </Box>
        </Flex>
    );
};

export default QuotaCard;
