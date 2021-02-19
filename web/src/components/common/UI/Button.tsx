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
  width: 50%;
  height: 60px;
  border-radius: 5px;
  background-color: #036;
  color: #ffffff;
  font-size: 24px;
`;

const StyledDisabledButton = styled.button`
  margin-top: 20px;
  width: 50%;
  height: 60px;
  border-radius: 5px;
  background-color: #d3d3d3;
  color: #ffffff;
  font-size: 24px;
`;

export const StyledFormButton: React.FC<IButtonProps> = (props: any) => {
  const { children, ...rest } = props;
  return (
    <StyledButton className="misc-class-m-form-submit-btn" {...rest}>
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

export interface IButtonProps {
  children?: React.ReactNode;
  onClick?: (e: any) => void;
  style?: any;
  type?: any;
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
