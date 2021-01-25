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
import theme from '../../../theme';

const StyledButton = styled.button`
  margin-right: 16px;
  padding: 8px 16px;
  border: none;
  background-color: ${theme.colors.bcorange};
  color: ${theme.colors.bcblue};
  text-transform: uppercase;
  letter-spacing: 0.2em;
  border-radius: 2px;
  cursor: pointer;
  -webkit-transition-duration: 0.4s; /* Safari */
  transition-duration: 0.4s;
`;

interface ICreateButtonProps {
  onClick: (e: any) => void;
  children: React.ReactNode;
}

const CreateButton: React.FC<ICreateButtonProps> = (props) => {
  const { children, ...rest } = props;

  return <StyledButton {...rest}>{children}</StyledButton>;
};

export default CreateButton;
