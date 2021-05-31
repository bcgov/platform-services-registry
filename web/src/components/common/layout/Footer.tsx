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
import React from 'react';
import theme from '../../../theme';

const StyledFooter = styled.footer`
  z-index: ${theme.zIndices[1]};
  background-color: #036;
  border-top: 2px solid #fcba19;
  color: #fff;
  display: flex;
  flex-flow: row wrap;
  text-align: center;
  position: fixed;
  bottom: 0px;
  height: 46px;
  @media (max-width: ${theme.breakpoints[1]}) {
    height: 55px;
  }
  width: 100%;
`;

const StyledUl = styled.ul`
  margin: 0;
  color: #fff;
  list-style: none;
  align-items: center;
  height: 100%;
  display: flex;
  flex-flow: row wrap;
`;

const StyledLi = styled.li`
  border-right: 1px solid #4b5e7e;
  padding-left: 5px;
  padding-right: 5px;
`;

const StyledLink = styled.a`
  font-size: 0.813em;
  font-weight: normal; /* 400 */
  color: #fff;
`;

const Footer = () => (
  <StyledFooter>
    <StyledUl>
      <StyledLi>
        <StyledLink href=".">Home</StyledLink>
      </StyledLi>
      <StyledLi>
        <StyledLink href="https://www2.gov.bc.ca/gov/content/home/disclaimer">
          Disclaimer
        </StyledLink>
      </StyledLi>
      <StyledLi>
        <StyledLink href="https://www2.gov.bc.ca/gov/content/home/privacy">Privacy</StyledLink>
      </StyledLi>
      <StyledLi>
        <StyledLink href="https://www2.gov.bc.ca/gov/content/home/accessibility">
          Accessibility
        </StyledLink>
      </StyledLi>
      <StyledLi>
        <StyledLink href="https://www2.gov.bc.ca/gov/content/home/copyright">Copyright</StyledLink>
      </StyledLi>
      <StyledLi>
        <StyledLink href="https://github.com/bcgov/platform-services-registry/issues">
          Contact Us
        </StyledLink>
      </StyledLi>
    </StyledUl>
  </StyledFooter>
);

export default Footer;
