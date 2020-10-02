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

import styled from '@emotion/styled';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Flex } from 'rebass';
import theme from '../theme';
import { LayoutSet } from '../types';
import clearDropdown from '../utils/clearDropdownMenu';
import Footer from './footer';
import Header from './header';

interface ILayoutProps {
  children: React.ReactNode;
  name: LayoutSet;
}

const StyledMain = styled.main`
  margin-top: ${theme.spacingIncrements[1]};
`;

const Layout: React.FC<ILayoutProps> = props => {
  const { children, name } = props;

  // this is to clear any left out dropdown menus
  window.onclick = function () {
    clearDropdown();
  }

  return (
    <div >
      <ToastContainer style={{ width: "500px" }} />
      <Header name={name} />
      <Flex px={['60px', '130px']}>
        <StyledMain>
          {children}
        </StyledMain>
      </Flex>
      <Footer />
    </div>
  );
};

export default Layout;