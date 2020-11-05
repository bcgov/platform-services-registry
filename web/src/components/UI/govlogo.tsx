import { css } from '@emotion/core';
import styled from '@emotion/styled';
import React from 'react';
import logo from '../../assets/images/bcid_h_rgb_rev.svg';
import logoMobile from '../../assets/images/logo.svg';
import Aux from '../../hoc/auxillary';
import theme from '../../theme';

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