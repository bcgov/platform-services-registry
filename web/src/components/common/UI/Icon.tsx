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

import React, { CSSProperties, MouseEventHandler } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import theme from '../../../theme';
import { ColorSet } from '../../../types';

interface IIconProps {
  onClick?: MouseEventHandler<SVGSVGElement>;
  hover?: boolean;
  name?: string;
  color: ColorSet;
  width?: number | 'auto';
  height?: number | 'auto';
  style?: CSSProperties;
}

interface IBaseIconPropstest extends IIconProps {
  displayIcon: IconProp;
}

export const BaseIcon: React.FC<IBaseIconPropstest> = (props) => {
  const {
    onClick,
    hover,
    color,
    width = theme.icons.defaultWidth,
    height = theme.icons.defaultHeight,
    style = {},
    displayIcon,
  } = props;
  return (
    <FontAwesomeIcon
      icon={displayIcon}
      onClick={onClick}
      color={theme.colors[color]}
      style={{
        ...style,
        cursor: hover ? 'pointer' : 'default',
        width: `${width}em`,
        height: `${height}em`,
      }}
    />
  );
};

export default BaseIcon;
