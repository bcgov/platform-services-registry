import { css } from '@emotion/core';
import styled from '@emotion/styled';
import React from 'react';
import Aux from './auxillary';
import logo from './bcid_h_rgb_rev.svg';
import logoMobile from './logo.svg';

const noMargin = css`
  margin-bottom: 0;
`;

const LargeLogo = styled.img`
  ${noMargin}
  width: 175px;
  @media (max-width: 480px) {
    display: none;
  }
`;

const SmallLogo = styled.img`
  ${noMargin}
  width: 50px;
  @media (min-width: 480px) {
    display: none;
  }
`;

const GovLogo = () => (
  <Aux>
    <LargeLogo src={logo} alt="Government of British Columbia" />
    <SmallLogo src={logoMobile} alt="Government of British Columbia" />
  </Aux>
);

export default GovLogo;