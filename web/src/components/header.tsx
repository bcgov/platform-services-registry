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
import { DROPDOWN_CLASSNAME } from '../constants';
import theme from '../theme';
import { LayoutSet, MenuItem } from '../types';
import typography from '../typography';
import Authbutton from './authbutton';
import CreateButton from './CreateButton';
import DropdownMenu from './DropdownMenu';
import DropdownMenuItem from './DropdownMenuItem';
import Icon from './Icon';
import GovLogo from './UI/govlogo';

const StyledHeader = styled.header`
  background-color: ${theme.colors.primary};
  color: ${theme.colors.contrast}
  position: fixed;
  top: 0;
  width: 100%;
  z-index: ${theme.zIndices[4]};
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

const ContainerDesktop = styled.div`
  @media (max-width: ${theme.breakpoints[1]}) {
    display: none;
  }
`;

const ContainerMobile = styled.div`
  @media (min-width: ${theme.breakpoints[1]}) {
    display: none;
  }
`;

const H2 = styled.h2`
  ${typography.toString()}
  margin: 6px 3px 6px 0;
  padding: 0px 4px;
  text-decoration: none;
  font-size: 1.54912em;
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

  const dropdownMenuID: string = 'DropdownCreatebutton';

  const handleDDDesktop = (event: any) => {
    event.stopPropagation();
    document?.getElementById(dropdownMenuID)?.classList.toggle(DROPDOWN_CLASSNAME);
  };

  if (name === 'min') {
    return null;
  } else {
    return (
      <StyledNav>
        {(name === 'auth') ? (
          <ContainerDesktop>
            <CreateButton onClick={handleDDDesktop}>
              Create
            </CreateButton>
            <Authbutton />
            <DropdownMenu menuItems={dirs} dropdownID={dropdownMenuID} />
          </ContainerDesktop>
        ) : (
            <ContainerDesktop>
              <Authbutton />
            </ContainerDesktop>
          )}
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
    title: "Namespace",
    subTitle: 'Add a namespace set',
    href: "/namespaces/create",
    onClickCB: () => { }
  }];

  return (
    <StyledHeader>
      <StyledBanner>
        <GovLogo />
        <H2>Platform Services Registry</H2>
        {(name !== 'min') && (<Nav name={name} dirs={dirs} handleDDMobile={handleDDMobile} isDDMobileOpen={isDDMobileOpen} />)}
      </StyledBanner>
      <ContainerMobile>
        {isDDMobileOpen && (
          <StyledDropdownMobile >
            <Authbutton />
            {(name === 'auth') && (<div>
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
