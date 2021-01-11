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

import { css } from '@emotion/core';
import styled from '@emotion/styled';
import React from 'react';
import logo from '../../../assets/images/bcid_h_rgb_rev.svg';
import logoMobile from '../../../assets/images/logo.svg';
import Aux from "../../../hoc/auxillary";
import theme from '../../../theme';

const noMargin = css`
  margin-bottom: 0;
`;

const LargeLogo = styled.img`
  ${noMargin}
  width: 175px;
  @media (max-width: ${theme.breakpoints[0]}) {
    display: none;
  }
`;

const SmallLogo = styled.img`
  ${noMargin}
  width: 50px;
  @media (min-width: ${theme.breakpoints[0]}) {
    display: none;s
  }
`;

const GovLogo = () => (
  <Aux>
    <LargeLogo src={logo} alt="Government of British Columbia" />
    <SmallLogo src={logoMobile} alt="Government of British Columbia" />
  </Aux>
);

export default GovLogo;
