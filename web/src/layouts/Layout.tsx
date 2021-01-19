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
import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from '../components/common/layout/Footer';
import Header from '../components/common/layout/Header';
import { BackdropForProcessing } from '../components/common/UI/Backdrop';
import CommonStateContext from '../contexts/commonStateContext';
import theme from '../theme';

// this is to set min width in windows resizing
const StyledDiv = styled.div`
  min-width: 320px;
`;

const StyledMain = styled.main`
  margin-bottom: ${theme.spacingIncrements[1]};
  margin-top: ${theme.navBar.desktopFixedHeight};
  padding-top: ${theme.spacingIncrements[0]};
  margin-left: ${theme.spacingIncrements[2]};
  margin-right: ${theme.spacingIncrements[2]};
  @media (max-width: ${theme.breakpoints[1]}) {
    margin-left: ${theme.spacingIncrements[0]};
    margin-right: ${theme.spacingIncrements[0]};
  } 
`;

interface ILayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<ILayoutProps> = props => {
  const { children } = props;

  const [openBackdrop, setOpenBackdrop] = useState(false);

  return (
    <StyledDiv>
      <ToastContainer style={{ width: "500px" }} />
      {openBackdrop && (<BackdropForProcessing />)}
      <Header auth />
      <CommonStateContext.Provider value={{ setOpenBackdrop }}>
        <StyledMain>
          {children}
        </StyledMain>
      </CommonStateContext.Provider>
      <Footer />
    </StyledDiv>
  );
};

export const PublicLayout: React.FC<ILayoutProps> = props => {
  const { children } = props;

  return (
    <StyledDiv>
      <Header />
      <StyledMain>
        {children}
      </StyledMain>
      <Footer />
    </StyledDiv>
  );
};
