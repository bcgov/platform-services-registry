//
// Copyright © 2020 Province of British Columbia
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,git
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Box, Flex, Text } from 'rebass';

interface Props {
    errorMessage: string;
}

const ErrorPage: React.FC<Props> = ({ errorMessage }) => {
  return (
    <Box>
      <Text as="h1" mx={2}>
        React Error
      </Text>
      Something seems to have gone wrong...
      <Text mb={3} as="p" fontSize={[2, 3, 3]} mt={1}>
        Error message: {errorMessage}
      </Text>
      <NavLink to="/">Go back to the home page</NavLink>
    </Box>
  );
};

export default ErrorPage;