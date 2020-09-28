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
import { default as React } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { MenuItem as IMenuItemProps } from '../types';

const StyledDropdownItem = styled.text`
  display: block;
  padding: 10px;
  cursor: pointer;
  text-decoration: none;
  '&:hover': {
    background: #ddd;
  }
`;

const DropdownMenuItem: React.FC<IMenuItemProps> = (props) => {
  const { href, title, subTitle, onClickCB } = props;
  if (!!href) {
    return (
      <RouterLink to={href}>
        <StyledDropdownItem>
          <h4>{title}</h4>
          {subTitle}
        </StyledDropdownItem>
      </RouterLink>
    );
  } else {
    return (
      <StyledDropdownItem onClick={onClickCB}>
        <h4>{title}</h4>
        {subTitle}
      </StyledDropdownItem>
    );
  }
};

export default DropdownMenuItem;