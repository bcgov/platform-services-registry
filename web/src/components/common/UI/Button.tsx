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

const StyledButton = styled.button`
  margin-top: 20px;
  width: clamp(30%, 50%, 80%);
  height: 60px;
  border-radius: 5px;
  background-color: #036;
  color: #ffffff;
  font-size: 24px;
  @media only screen and (max-width: 1200px) {
    font-size: inherit;
  }
`;

const StyledDisabledButton = styled.button`
  margin-top: 20px;
  width: clamp(30%, 50%, 80%);
  height: 60px;
  border-radius: 5px;
  background-color: #d3d3d3;
  color: #ffffff;
  font-size: 24px;
  @media only screen and (max-width: 1200px) {
    font-size: inherit;
  }
`;

const SquareButton = styled.button<IButtonProps>`
  width: 30px;
  height: 30px;
  border-radius: 5px;
  background-color: ${(props) => (props.inversed ? '#d3d3d3' : '#036')};
  color: ${(props) => (props.inversed ? '#036' : '#ffffff')};
  font-size: 18px;
`;

const smallButtonStyle = {
  maxHeight: '40px',
  fontSize: '18px',
  maxWidth: '40%',
};

export const StyledFormButton: React.FC<IButtonProps> = (props: any) => {
  const { children, smallButton, ...rest } = props;
  const extraStyle = smallButton && smallButtonStyle;
  const appliedStyle = {
    ...extraStyle,
    ...rest.style,
  };
  return (
    <StyledButton className="misc-class-m-form-submit-btn" {...rest} style={appliedStyle}>
      {children}
    </StyledButton>
  );
};

export const StyledFormDisabledButton: React.FC<IButtonProps> = (props: any) => {
  const { children, ...rest } = props;
  return (
    <StyledDisabledButton disabled {...rest}>
      {children}
    </StyledDisabledButton>
  );
};

export const SquareFormButton: React.FC<IButtonProps> = (props: any) => {
  const { children, ...rest } = props;
  return (
    <SquareButton className="misc-class-m-form-submit-btn" {...rest}>
      {children}
    </SquareButton>
  );
};

export interface IButtonProps {
  children?: React.ReactNode;
  onClick?: (e: any) => void;
  style?: any;
  type?: any;
  disabled?: boolean;
  inversed?: boolean;
  smallButton?: boolean;
}

const styles = {
  border: '1px solid #eee',
  borderRadius: 3,
  backgroundColor: '#FFFFFF',
  cursor: 'pointer',
  fontSize: 15,
  padding: '3px 10px',
  margin: 10,
};

export const Button: React.FC<IButtonProps> = (props) => (
  <button onClick={props.onClick} style={styles} type="button">
    {props.children}
  </button>
);

Button.defaultProps = {
  children: null,
  onClick: () => {
    // this is intentional (required by Sonarcloud)
  },
};
