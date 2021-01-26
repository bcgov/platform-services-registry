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
import { Link as RouterLink } from 'react-router-dom';
import { Text } from 'rebass';
import theme from '../../../theme';
import { MenuItem as IMenuItemProps } from '../../../types';

const StyledDropdownItem = styled.div`
  margin: 20px 15px 15px 0px;
  border-bottom: 1px solid;
  @media (max-width: ${theme.breakpoints[1]}) {
    color: ${theme.colors.contrast};
  }
`;

const DropdownMenuItem: React.FC<IMenuItemProps> = (props) => {
  const { href, title, subTitle, onClickCB, handleOnClick } = props;

  if (href) {
    return (
      <RouterLink className="misc-class-m-dropdown-link" to={href}>
        <StyledDropdownItem onClick={handleOnClick}>
          <h3>{title}</h3>
          <Text mb="12px">{subTitle}</Text>
        </StyledDropdownItem>
      </RouterLink>
    );
  }
  return (
    <StyledDropdownItem onClick={onClickCB}>
      <h3>{title}</h3>
      {subTitle}
    </StyledDropdownItem>
  );
};

export default DropdownMenuItem;
