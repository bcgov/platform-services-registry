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
import theme from '../theme';
import { LayoutSet } from '../types';
import Footer from './footer';
import Header from './header';

// this is to set min width in windows resizing
const StyledDiv = styled.main`
  min-width: 380px;
`;

const StyledMain = styled.main`
  margin-top: ${theme.spacingIncrements[1]};
  padding-left: ${theme.spacingIncrements[1]};
  padding-right: ${theme.spacingIncrements[1]};
  @media (max-width: ${theme.breakpoints[0]}) {
    padding-left: ${theme.spacingIncrements[0]};
    padding-right: ${theme.spacingIncrements[0]};
  }
`;

interface ILayoutProps {
  children: React.ReactNode;
  name: LayoutSet;
}

const Layout: React.FC<ILayoutProps> = props => {
  const { children, name } = props;

  return (
    <StyledDiv>
      <ToastContainer style={{ width: "500px" }} />
      <Header name={name} />
      <StyledMain>
        {children}
      </StyledMain>
      <Footer />
    </StyledDiv>
  );
};

export default Layout;