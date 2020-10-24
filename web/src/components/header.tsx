//
// DevHub
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
// Created by Jason Leach on 2020-06-05.
//

import styled from '@emotion/styled';
import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { HOME_PAGE_URL, LAYOUT_SET_AUTH, LAYOUT_SET_MIN, ROUTE_PATHS } from '../constants';
import theme from '../theme';
import { LayoutSet, MenuItem } from '../types';
import typography from '../typography';
import useComponentVisible from '../utils/useComponentVisible';
import Authbutton from './authbutton';
import CreateButton from './CreateButton';
import DropdownMenu from './DropdownMenu';
import DropdownMenuItem from './DropdownMenuItem';
import Icon from './Icon';
import GovLogo from './UI/govlogo';
import { ContainerDesktop, ContainerMobile } from './UI/responsiveContainer';

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

const H2 = styled.h2`
  ${typography.toString()}
  margin: 6px 3px 6px 0;
  padding: 0px 4px;
  text-decoration: none;
  font-size: 1.54912em;
  color: ${theme.colors.contrast};
  @media (max-width: ${theme.breakpoints[0]}) {
    font-size: 1em;
  }
`;

interface INavProps {
  name: LayoutSet;
  isDDMobileOpen: boolean;
  handleDDMobile: (e: any) => void;
  dirs: Array<MenuItem>;
}

const Nav: React.FC<INavProps> = props => {
  const { name, handleDDMobile, isDDMobileOpen, dirs } = props;

  const isAuthenticated = (name === LAYOUT_SET_AUTH);

  const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(false);

  const handleDDDesktop = () => {
    setIsComponentVisible(!isComponentVisible);
  };

  if (name === LAYOUT_SET_MIN) {
    return null;
  } else {
    return (
      <StyledNav>
        <ContainerDesktop>
          {isAuthenticated && (<CreateButton onClick={handleDDDesktop}>Create</CreateButton>)}
          <Authbutton />
          {isAuthenticated && isComponentVisible && (<DropdownMenu handleDDDesktop={handleDDDesktop} ref={ref} menuItems={dirs} />)}
        </ContainerDesktop>
        <ContainerMobile>
          <Icon hover color={'contrast'} name={isDDMobileOpen ? 'close' : 'menuStack'}
            onClick={handleDDMobile} width={1.4} height={1.4} />
        </ContainerMobile>
      </StyledNav>
    )
  }
};

interface IHeaderProps {
  name: LayoutSet;
}

const Header: React.FC<IHeaderProps> = props => {
  const { name } = props;

  const [isDDMobileOpen, setIsDDMobileOpen] = useState(false);

  const handleDDMobile = () => {
    setIsDDMobileOpen(!isDDMobileOpen);
  };

  const dirs = [{
    title: "A new Openshift Project Set",
    subTitle: "Create 4 Project namespaces in Silver cluster",
    href: ROUTE_PATHS.FORM,
    onClickCB: () => { }
  }];

  return (
    <StyledHeader>
      <StyledBanner>
        <RouterLink style={{ display: 'flex', alignItems: 'center' }} to={HOME_PAGE_URL}>
          <GovLogo />
          <H2>Platform Services Registry</H2>
        </RouterLink>
        {(name !== LAYOUT_SET_MIN) && (<Nav name={name} dirs={dirs} handleDDMobile={handleDDMobile} isDDMobileOpen={isDDMobileOpen} />)}
      </StyledBanner>
      <ContainerMobile>
        {isDDMobileOpen && (
          <StyledDropdownMobile >
            <Authbutton />
            {(name === LAYOUT_SET_AUTH) && (<div>
              {dirs.map(
                (item, index) =>
                  <DropdownMenuItem key={index + item.title} href={item.href} title={item.title} subTitle={item.subTitle} onClickCB={item.onClickCB} />
              )} </div>
            )}
          </StyledDropdownMobile>
        )}
      </ContainerMobile>
    </StyledHeader>
  );
};

export default Header;
