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
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
import styled from '@emotion/styled';
import { useKeycloak } from '@react-keycloak/web';
import queryString from 'querystring';
import React, { useState } from 'react';
import { useLocation } from 'react-router';
import { Redirect, useHistory } from 'react-router-dom';
import { Box, Text, Flex } from 'rebass';
import { Label, Checkbox } from '@rebass/forms';
import { HOME_PAGE_URL, ROUTE_PATHS } from '../constants';
import { StyledButton } from '../components/common/UI/AuthButton';

const StyledExternalLink = styled.a`
  color: #003366;
  font-weight: 600;
  :visited: {
    color: #003366;
  }
`;

const StyledacknowledgeMessage = styled(Label)`
  ${({ active }: any) => active && ` color: red;`}
`;

const StyledList = styled.ul`
  margin-top: 10px;
  padding-left: 15px;
`;

const useQuery = () => {
  const location = useLocation();
  return queryString.parse(location.search.replace('?', '')) as any;
};

export const PublicLanding = () => {
  const { keycloak } = useKeycloak();
  const { redirect } = useQuery();
  const history = useHistory();
  const [isAttendedSession, SetIsAttendedSession] = useState<boolean>(false);
  const [showWarningMessage, setShowWarningMessage] = useState<boolean>(false);

  if (!keycloak) {
    return null;
  }

  if (keycloak?.authenticated) {
    return <Redirect to={redirect || HOME_PAGE_URL} />;
  }

  return (
    <Flex
      flexDirection="column"
      sx={{
        lineHeight: 2,
        maxHeight: 100,
      }}
    >
      <Box mb={3}>
        <Text as="h1" mb={3}>
          Welcome to BC Gov's Platform as a Service(PaaS) Product Registry
        </Text>
      </Box>
      <Box mb={3}>
        <Text as="h2" mb={2}>
          Make changes to an existing product
        </Text>
        <Text mb={2}>
          For existing application's hosted on OpenShift 4 Platform. You can update/change all
          product details and request product resource quota increases and downgrades (including
          CPU/RAM/Storage.)
        </Text>
        <StyledButton onClick={() => keycloak.login({ idpHint: 'idir' })}>Login</StyledButton>
      </Box>
      <Box mb={3}>
        <Text as="h2" mb={2}>
          Register a new product
        </Text>
        <Text mb={2}>
          Use this website if you are a Product Owner for a new cloud-native application and are
          interested in hosting the app on the OpenShift 4 Platform. You can learn about the BCGov's
          PaaS/OpenShift 4 Platform Service{' '}
          <StyledExternalLink
            rel="noopener noreferrer"
            href="https://developer.gov.bc.ca/topic/featured/Service-Overview-for-BC-Government-Private-Cloud-as-a-ServiceOpenshift-4-Platform"
            target="_blank"
          >
            here
          </StyledExternalLink>
        </Text>
      </Box>
      <Box mb={3}>
        <Text as="h3" mb={2}>
          Before you start
        </Text>
        <Text mb={2}>
          This website is for teams who've attended an onboarding session with the platform team (if
          you currently host an application on OpenShift, you’ve done this already.) If you haven’t
          attended an onboarding session, please contact the Platform Director(
          <StyledExternalLink
            rel="noopener noreferrer"
            href="mailto:olena.mitovska@gov.bc.ca"
            target="_blank"
          >
            olena.mitovska@gov.bc.ca
          </StyledExternalLink>
          ) to book an onboarding session.
        </Text>
        <StyledacknowledgeMessage pb={2} active={showWarningMessage}>
          <Checkbox
            name="attendedOnboardingSession"
            type="checkbox"
            onChange={() => {
              SetIsAttendedSession(!isAttendedSession);
            }}
          />
          <Text as="h3" fontSize="16px" my={0} lineHeight="normal" ml={2}>
            I confirm I’ve attended an onboarding session.
          </Text>
        </StyledacknowledgeMessage>
        <StyledButton
          onClick={() => {
            if (isAttendedSession) {
              history.push(ROUTE_PATHS.PROFILE_CREATE);
              keycloak.login({ idpHint: 'idir' });
              return;
            }
            setShowWarningMessage(true);
          }}
        >
          REGISTER A NEW PRODUCT (log in with BC IDIR)
        </StyledButton>
        {showWarningMessage && (
          <Text as="p" color="red">
            Please confirm above checkbox before continuing.
          </Text>
        )}
      </Box>
      <Box mb={3}>
        <Text as="h3">What you will need</Text>
        <StyledList>
          <Text as="li">
            A BC IDIR (you'll be asked to log in with your IDIR to get to the registry)
          </Text>
          <Text as="li">A descriptive product name (no acronyms)</Text>
          <Text as="li">
            Contact details and IDIR IDs for a product owner and up to 2 technical leads
          </Text>
          <Text as="li">
            An idea of which common components you will use (see common components list)
          </Text>
        </StyledList>
      </Box>
    </Flex>
  );
};
