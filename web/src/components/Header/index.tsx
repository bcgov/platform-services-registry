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
import AuthButton from '../AuthButton';
import logo from './bcgovlogo.svg';

const StyledHeader = styled.header`
  background-color: #036;
  border-bottom: 2px solid #fcba19;
  color: #fff;
  padding: 0 65px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* flex-flow: row wrap; */
`;

const StyledImage = styled.img`
  animation: logo-spin infinite 20s linear;
  height: 80px;
`;

const StyledTitle = styled.h1`
  font-family: 'Noto Sans', 'Calibri', 'Arial', 'Sans Serif';
  font-size: 24px;
  font-weight: normal;
  margin: 13px 18px;
  padding: 0.5em 0;
`;

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
`;

export default () => {
  return (
    <StyledHeader>
      <StyledDiv>
        <StyledImage src={logo} alt="logo" />
        <StyledTitle>Platform Services Project Registry</StyledTitle>
      </StyledDiv>
      <AuthButton />
    </StyledHeader>
  );
};
