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
import theme from '../../../theme';
import { ColorSet } from '../../../types';

type IconSet =
  | 'user'
  | 'menuStack'
  | 'close'
  | 'goBack'
  | 'edit'
  | 'email'
  | 'github'
  | 'sort'
  | 'search'
  | 'download'
  | 'checkmark';

interface IIconProps {
  onClick?: MouseEventHandler<SVGSVGElement>;
  hover?: boolean;
  viewBox?: string;
  name: IconSet;
  color: ColorSet;
  width?: number | 'auto';
  height?: number | 'auto';
  style?: CSSProperties;
}

interface IBaseIconProps extends IIconProps {
  children: React.ReactNode;
}

const BaseIcon: React.FC<IBaseIconProps> = (props) => {
  const {
    onClick,
    hover,
    viewBox,
    color,
    width = theme.icons.defaultWidth,
    height = theme.icons.defaultHeight,
    style = {},
    children,
  } = props;
  return (
    <svg
      onClick={onClick}
      viewBox={viewBox}
      fill={theme.colors[color]}
      style={{
        ...style,
        cursor: hover ? 'pointer' : 'default',
        width: `${width}em`,
        height: `${height}em`,
      }}
    >
      {children}
    </svg>
  );
};

const Icon: React.FC<IIconProps> = (props) => {
  const { name } = props;
  switch (name) {
    case 'user':
      return (
        <BaseIcon viewBox="0 0 448 512" {...props}>
          <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z" />
        </BaseIcon>
      );
    case 'menuStack':
      return (
        <BaseIcon viewBox="0 0 448 512" {...props}>
          <path d="M436 124H12c-6.627 0-12-5.373-12-12V80c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12zm0 160H12c-6.627 0-12-5.373-12-12v-32c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12zm0 160H12c-6.627 0-12-5.373-12-12v-32c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12z" />
        </BaseIcon>
      );
    case 'close':
      return (
        <BaseIcon viewBox="0 0 320 512" {...props}>
          <path d="M207.6 256l107.72-107.72c6.23-6.23 6.23-16.34 0-22.58l-25.03-25.03c-6.23-6.23-16.34-6.23-22.58 0L160 208.4 52.28 100.68c-6.23-6.23-16.34-6.23-22.58 0L4.68 125.7c-6.23 6.23-6.23 16.34 0 22.58L112.4 256 4.68 363.72c-6.23 6.23-6.23 16.34 0 22.58l25.03 25.03c6.23 6.23 16.34 6.23 22.58 0L160 303.6l107.72 107.72c6.23 6.23 16.34 6.23 22.58 0l25.03-25.03c6.23-6.23 6.23-16.34 0-22.58L207.6 256z" />
        </BaseIcon>
      );
    case 'goBack':
      return (
        <BaseIcon viewBox="0 0 320 512" {...props}>
          <path d="M229.9 473.899l19.799-19.799c4.686-4.686 4.686-12.284 0-16.971L94.569 282H436c6.627 0 12-5.373 12-12v-28c0-6.627-5.373-12-12-12H94.569l155.13-155.13c4.686-4.686 4.686-12.284 0-16.971L229.9 38.101c-4.686-4.686-12.284-4.686-16.971 0L3.515 247.515c-4.686 4.686-4.686 12.284 0 16.971L212.929 473.9c4.686 4.686 12.284 4.686 16.971-.001z" />
        </BaseIcon>
      );
    case 'edit':
      return (
        <BaseIcon viewBox="0 0 117.74 122.88" {...props}>
          <path d="M94.62,2c-1.46-1.36-3.14-2.09-5.02-1.99c-1.88,0-3.56,0.73-4.92,2.2L73.59,13.72l31.07,30.03l11.19-11.72 c1.36-1.36,1.88-3.14,1.88-5.02s-0.73-3.66-2.09-4.92L94.62,2L94.62,2L94.62,2z M41.44,109.58c-4.08,1.36-8.26,2.62-12.35,3.98 c-4.08,1.36-8.16,2.72-12.35,4.08c-9.73,3.14-15.07,4.92-16.22,5.23c-1.15,0.31-0.42-4.18,1.99-13.6l7.74-29.61l0.64-0.66 l30.56,30.56L41.44,109.58L41.44,109.58L41.44,109.58z M22.2,67.25l42.99-44.82l31.07,29.92L52.75,97.8L22.2,67.25L22.2,67.25z" />
        </BaseIcon>
      );
    case 'email':
      return (
        <BaseIcon viewBox="0 0 122.88 78.607" {...props}>
          <path d="M61.058,65.992l24.224-24.221l36.837,36.836H73.673h-25.23H0l36.836-36.836 L61.058,65.992L61.058,65.992z M1.401,0l59.656,59.654L120.714,0H1.401L1.401,0z M0,69.673l31.625-31.628L0,6.42V69.673L0,69.673z M122.88,72.698L88.227,38.045L122.88,3.393V72.698L122.88,72.698z" />
        </BaseIcon>
      );
    case 'github':
      return (
        <BaseIcon viewBox="0 0 640 640" {...props}>
          <path d="M319.988 7.973C143.293 7.973 0 151.242 0 327.96c0 141.392 91.678 261.298 218.826 303.63 16.004 2.964 21.886-6.957 21.886-15.414 0-7.63-.319-32.835-.449-59.552-89.032 19.359-107.8-37.772-107.8-37.772-14.552-36.993-35.529-46.831-35.529-46.831-29.032-19.879 2.209-19.442 2.209-19.442 32.126 2.245 49.04 32.954 49.04 32.954 28.56 48.922 74.883 34.76 93.131 26.598 2.882-20.681 11.15-34.807 20.315-42.803-71.08-8.067-145.797-35.516-145.797-158.14 0-34.926 12.52-63.485 32.965-85.88-3.33-8.078-14.291-40.606 3.083-84.674 0 0 26.87-8.61 88.029 32.8 25.512-7.075 52.878-10.642 80.056-10.76 27.2.118 54.614 3.673 80.162 10.76 61.076-41.386 87.922-32.8 87.922-32.8 17.398 44.08 6.485 76.631 3.154 84.675 20.516 22.394 32.93 50.953 32.93 85.879 0 122.907-74.883 149.93-146.117 157.856 11.481 9.921 21.733 29.398 21.733 59.233 0 42.792-.366 77.28-.366 87.804 0 8.516 5.764 18.473 21.992 15.354 127.076-42.354 218.637-162.274 218.637-303.582 0-176.695-143.269-319.988-320-319.988l-.023.107z" />
        </BaseIcon>
      );
    case 'sort':
      return (
        <BaseIcon viewBox="0 0 99.42 122.88" {...props}>
          <path d="M49.71,0L0,51.7c33.14,0,66.28,0,99.42,0L49.71,0L49.71,0z M49.71,122.88L0,71.18c33.14,0,66.28,0,99.42,0 L49.71,122.88L49.71,122.88z" />
        </BaseIcon>
      );
    case 'search':
      return (
        <BaseIcon viewBox="0 0 50 50" {...props}>
          <path d="M 21 3 C 11.601563 3 4 10.601563 4 20 C 4 29.398438 11.601563 37 21 37 C 24.355469 37 27.460938 36.015625 30.09375 34.34375 L 42.375 46.625 L 46.625 42.375 L 34.5 30.28125 C 36.679688 27.421875 38 23.878906 38 20 C 38 10.601563 30.398438 3 21 3 Z M 21 7 C 28.199219 7 34 12.800781 34 20 C 34 27.199219 28.199219 33 21 33 C 13.800781 33 8 27.199219 8 20 C 8 12.800781 13.800781 7 21 7 Z" />
        </BaseIcon>
      );
    case 'download':
      return (
        <BaseIcon viewBox="0 0 24 24" {...props}>
          <path d="M19.355,10.036C18.674,6.595,15.641,4,12,4C9.108,4,6.603,5.639,5.352,8.036C2.343,8.36,0,10.906,0,14c0,3.314,2.686,6,6,6 h13c2.761,0,5-2.239,5-5C24,12.36,21.948,10.221,19.355,10.036z M12,18l-5-5h3V9h4v4h3L12,18z" />
        </BaseIcon>
      );
    case 'checkmark':
      return (
        <BaseIcon viewBox="0 0 24 24" {...props}>
          <path d="M 20.292969 5.2929688 L 9 16.585938 L 4.7070312 12.292969 L 3.2929688 13.707031 L 9 19.414062 L 21.707031 6.7070312 L 20.292969 5.2929688 z" />
        </BaseIcon>
      );
  }
};

export default Icon;
