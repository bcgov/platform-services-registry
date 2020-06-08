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
import React from 'react';
import typography from '../../typography';
import AuthButton from '../AuthButton';
import GovLogo from '../UI/GovLogo';

const StyledHeader = styled.header`
  background-color: #036;
  border-bottom: 2px solid #fcba19;
  padding: 0 65px 0 65px;
  color: #fff;
  display: flex;
  height: 65px;
  top: 0px;
  position: fixed;
  width: 100%;
`;

const StyledBanner = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 0 10px 0 0;
  /* border-style: dotted;
  border-width: 1px;
  border-color: lightgrey; */
`;

const H2 = styled.h2`
  ${typography.toString()}
  margin: 6px 3px 6px 0;
  padding: 0px 4px;
  text-decoration: none;
  font-size: 1.54912em;
`;

const Container = styled.div`
  display: flex;
  font-size: 1em;
`;

export default () => {
  return (
    <StyledHeader>
      <StyledBanner>
        <GovLogo />
        <Container>
          <H2>Platform Services Project Registry</H2>
        </Container>
      </StyledBanner>
      <AuthButton />
    </StyledHeader>
  );
};
