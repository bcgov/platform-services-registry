//
// Copyright © 2020 Province of British Columbia
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

import styled from '@emotion/styled';
import React, { useState } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { Text } from 'rebass';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { HOME_PAGE_URL, ROUTE_PATHS } from '../../../constants';
import theme from '../../../theme';
import { MenuItem } from '../../../types';
import typography from '../../../typography';
import Authbutton from '../UI/AuthButton';
import CreateButton from '../UI/CreateButton';
import DropdownMenuItem from '../UI/DropdownMenuItem';
import GovLogo from '../UI/GovLogo';
import { BaseIcon } from '../UI/Icon';
import { ContainerDesktop, ContainerMobile } from '../UI/ResponsiveContainer';

const StyledHeader = styled.header`
  background-color: ${theme.colors.primary};
  color: ${theme.colors.contrast};
  position: fixed;
  top: 0;
  width: 100%;
  z-index: ${theme.zIndices[1]};
`;

const StyledBanner = styled.div`
  align-items: center;
  color: ${theme.colors.contrast};
  display: flex;
  flex-direction: row;
  height: ${theme.navBar.desktopFixedHeight};
  padding-left: ${theme.spacingIncrements[0]};
  padding-right: ${theme.spacingIncrements[0]};
  border-bottom: 2px solid ${theme.colors.bcorange};
`;

const StyledDropdownMobile = styled.div`
  align-items: center;
  background-color: ${theme.colors.bclightblue};
  padding: ${theme.spacingIncrements[0]};
  display: block;
  flex-direction: row;
`;

const StyledNav = styled.div`
  margin-left: auto;
`;

const StyledText = styled(Text)`
  ${typography.toString()}
  text-decoration: none;
  font-weight: bold;
  min-width: 150px;
`;

interface INavProps {
  isAuthenticated: boolean;
  isDDMobileOpen: boolean;
  handleDDMobile: (e: any) => void;
  dirs: Array<MenuItem>;
}

const Nav: React.FC<INavProps> = (props) => {
  const { isAuthenticated, handleDDMobile, isDDMobileOpen } = props;

  const history = useHistory();

  const handleCreateDesktop = () => {
    history.push(ROUTE_PATHS.PROFILE_CREATE);
  };

  return (
    <StyledNav>
      <ContainerDesktop>
        {isAuthenticated && <CreateButton onClick={handleCreateDesktop}>Create</CreateButton>}
        <Authbutton />
      </ContainerDesktop>
      <ContainerMobile>
        {isDDMobileOpen ? (
          <BaseIcon
            name="close"
            color="contrast"
            hover
            onClick={handleDDMobile}
            width={2}
            height={1.4}
            displayIcon={faTimes}
          />
        ) : (
          <BaseIcon
            name="menuStack"
            color="contrast"
            hover
            onClick={handleDDMobile}
            width={2}
            height={1.4}
            displayIcon={faBars}
          />
        )}
      </ContainerMobile>
    </StyledNav>
  );
};

interface IHeaderProps {
  auth?: boolean;
}

const Header: React.FC<IHeaderProps> = (props) => {
  const { auth: useAuthHeader } = props;

  const [isDDMobileOpen, setIsDDMobileOpen] = useState(false);

  const handleDDMobile = () => {
    setIsDDMobileOpen(!isDDMobileOpen);
  };

  const dirs = [
    {
      title: 'A new Openshift Project Set',
      subTitle: 'Create 4 Project namespaces',
      href: ROUTE_PATHS.PROFILE_CREATE,
      onClickCB: () => {
        // this is intentional (required by Sonarcloud)
      },
    },
  ];

  return (
    <StyledHeader>
      <StyledBanner>
        <RouterLink
          style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          to={HOME_PAGE_URL}
        >
          <GovLogo />
          <StyledText
            as="h2"
            color={theme.colors.contrast}
            fontSize={[3, 4, 4]}
            fontWeight={500}
            pl={[3, 0, 0]}
          >
            Platform Services Registry
          </StyledText>
        </RouterLink>
        <Nav
          isAuthenticated={!!useAuthHeader}
          dirs={dirs}
          handleDDMobile={handleDDMobile}
          isDDMobileOpen={isDDMobileOpen}
        />
      </StyledBanner>
      <ContainerMobile>
        {isDDMobileOpen && (
          <StyledDropdownMobile>
            <Authbutton />
            {!!useAuthHeader && (
              <div>
                {dirs.map((item, index) => (
                  <DropdownMenuItem
                    handleOnClick={handleDDMobile}
                    key={index + item.title}
                    href={item.href}
                    title={item.title}
                    subTitle={item.subTitle}
                    onClickCB={item.onClickCB}
                  />
                ))}
              </div>
            )}
          </StyledDropdownMobile>
        )}
      </ContainerMobile>
    </StyledHeader>
  );
};

export default Header;
