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
import { DROPDOWN_CLASSNAME } from '../constants';
import { MenuItem } from '../types';
import DropdownMenuItem from './DropdownMenuItem';

const StyledDropdown = styled.div`
  display: none;
  position: absolute;
  min-width: 100px;
  background-color: white;
  zIndex: 11
`;

interface IDropdownMenuProps {
  menuItems: Array<MenuItem>;
  dropdownID: string;
}

const DropdownMenu: React.FC<IDropdownMenuProps> = (props) => {
  const { menuItems, dropdownID } = props;

  return (
    <div className={DROPDOWN_CLASSNAME}>
      <StyledDropdown id={dropdownID}>
        {menuItems.map(
          (item, index) =>
            <DropdownMenuItem key={index + item.title} href={item.href} title={item.title} subTitle={item.subTitle} onClickCB={item.onClickCB} />
        )}
      </StyledDropdown>
    </div>
  );
};

export default DropdownMenu;