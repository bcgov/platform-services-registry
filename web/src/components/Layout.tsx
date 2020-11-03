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
const StyledDiv = styled.div`
  min-width: 320px;
`;

const StyledMain = styled.main`
  margin-top: ${theme.navBar.desktopFixedHeight};
  padding-top: ${theme.spacingIncrements[0]};
  margin-left: ${theme.spacingIncrements[2]};
  margin-right: ${theme.spacingIncrements[2]};
  @media (max-width: ${theme.breakpoints[1]}) {
    margin-left: ${theme.spacingIncrements[0]};
    margin-right: ${theme.spacingIncrements[0]};
  } 
`;

const StyledBackdrop = styled.div`
  position:fixed;
  z-index: ${theme.zIndices[2]};
  top:0px;
  left:0px;
  width:100%;
  height:100%;
  background:rgba(0,0,0,0.5);
`;

interface ILayoutProps {
  children: React.ReactNode;
  name: LayoutSet;
}

const Layout: React.FC<ILayoutProps> = props => {
  const { children, name } = props;

  const [openBackdrop, setOpenBackdrop] = React.useState(false);

  const openBackdropCB = () => {
    setOpenBackdrop(true);
  };

  const closeBackdropCB = () => {
    setOpenBackdrop(false);
  };

  return (
    <StyledDiv>
      <ToastContainer style={{ width: "500px" }} />
      {openBackdrop && (<StyledBackdrop />)}
      <Header name={name} />
      <StyledMain>
        {React.Children.map(children, (child: any) => {
          return React.cloneElement(child, {
            closeBackdropCB: closeBackdropCB,
            openBackdropCB: openBackdropCB
          });
        })}
      </StyledMain>
      <Footer />
    </StyledDiv>
  );
};

export default Layout;