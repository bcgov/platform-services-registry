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
import { keyframes, css } from '@emotion/react';
import { useKeycloak } from '@react-keycloak/web';
import queryString from 'querystring';
import React, { useState } from 'react';
import { useLocation } from 'react-router';
import { Redirect, useHistory } from 'react-router-dom';
import { HOME_PAGE_URL, ROUTE_PATHS } from '../constants';
import { StyledButton } from '../components/common/UI/AuthButton';

const StyledHeader = styled.h1`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  @media only screen and (max-width: 768px) {
    display: block;
  }
`;

const StyledSubHeader = styled.h2`
  margin-bottom: 0;
`;

const StyledExternalLink = styled.a`
  color: #003366;
  font-weight: 600;
  :visited: {
    color: #003366;
  }
`;
const StyledSmallHeader = styled.h4`
  margin-bottom: 0;
`;

const HomePageSectionContainer = styled.div`
  padding-bottom: 30px;
  width: 90vw;

  @media only screen and (min-width: 680px) {
    width: 80vw;
    max-height: 50vh;
  }

  @media only screen and (min-width: 1080px) {
    width: 60vw;
    max-height: 45vh;
  }
`;

const StyledParagraph = styled.div`
  padding: 15px 0px;
`;

const bounce = keyframes`
  from, 20%, 53%, 80%, to {
    transform: translate3d(0,0,0);
  }

  40%, 43% {
    transform: translate3d(0, -30px, 0);
  }

  70% {
    transform: translate3d(0, -15px, 0);
  }

  90% {
    transform: translate3d(0,-4px,0);
  }
`;

const StyledacknowledgeMessage = styled.p`
  padding: 15px 0px;
  ${({ active }: any) =>
    active &&
    css`
      color: red;
      animation: ${bounce} 1s ease;
    `}
`;

const StyledCheckbox = styled.input`
  transform: scale(2);
  margin: 5px 15px 0px 5px;
`;

const StyledListItem = styled.li`
  line-height: 20px;
`;

const StyledList = styled.ul`
  margin-top: 10px;
  padding-left: 15px;
`;

const StyledWarningMessage = styled.p`
  color: red;
  margin: 0;
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
    <>
      <StyledHeader>Welcome to BC Gov's Platform as a Service(PaaS) Project Registry</StyledHeader>
      <HomePageSectionContainer>
        <StyledSubHeader>Make changes to an existing project </StyledSubHeader>
        <StyledParagraph>
          For existing application's hosted on OpenShift 4 Platform. You can update/change all
          project details and request project resource quota increases and downgrades (including
          CPU/RAM/Storage.)
        </StyledParagraph>
        <StyledButton onClick={() => keycloak.login({ idpHint: 'idir' })}>Log In</StyledButton>
      </HomePageSectionContainer>
      <HomePageSectionContainer>
        <StyledSubHeader>Register a new project</StyledSubHeader>
        <StyledParagraph>
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
        </StyledParagraph>
        <StyledSmallHeader>Before you start</StyledSmallHeader>
        <StyledParagraph>
          This website is for teams who've attended an onboarding session with the platform team (if
          you currently host an application on OpenShift, you’ve done this already.) If you haven’t
          attended an onboarding session, please contact the Platform Director(
          <a rel="noopener noreferrer" href="mailto:olena.mitovska@gov.bc.ca" target="_blank">
            olena.mitovska@gov.bc.ca
          </a>
          ) to book an onboarding session.
        </StyledParagraph>

        <StyledacknowledgeMessage active={showWarningMessage}>
          <StyledCheckbox
            name="attendedOnboardingSession"
            type="checkbox"
            onChange={() => {
              SetIsAttendedSession(!isAttendedSession);
            }}
          />
          I confirm I’ve attended an onboarding session.
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
          REGISTER A NEW PROJECT (log in with BC IDIR)
        </StyledButton>
        {showWarningMessage && (
          <StyledWarningMessage>
            Please confirm above checkbox before continue.
          </StyledWarningMessage>
        )}
      </HomePageSectionContainer>

      <HomePageSectionContainer>
        <StyledSmallHeader>What you will need </StyledSmallHeader>
        <StyledList>
          <StyledListItem>
            A BC IDIR (you'll be asked to log in with your IDIR to get to the registry)
          </StyledListItem>
          <StyledListItem>A descriptive project name (no acronyms)</StyledListItem>
          <StyledListItem>
            Contact details and Github IDs for a product owner and up to 2 technical leads
          </StyledListItem>
          <StyledListItem>
            An idea of which common components you will use (see common components list)
          </StyledListItem>
        </StyledList>
      </HomePageSectionContainer>
    </>
  );
};
