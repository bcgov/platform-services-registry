import { CSSProperties, default as React, MouseEventHandler } from 'react';
import { default as theme, default as themes } from '../theme';
import { ColorSet } from '../types';

type IconSet
  = 'user'
  | 'menuStack'
  | 'close'

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

const BaseIcon: React.FC<IBaseIconProps> = props => {
  const { onClick, hover, viewBox, color, width = theme.icons.defaultWidth, height = theme.icons.defaultHeight, style = {}, children } = props;
  return (
    <svg
      onClick={onClick}
      viewBox={viewBox}
      fill={themes.colors[color]}
      style={{ ...style, cursor: !!hover ? 'pointer' : 'default', width: `${width}rem`, height: `${height}rem` }}
    >
      {children}
    </svg>
  );
};

const Icon: React.FC<IIconProps> = props => {
  const { name } = props;
  switch (name) {
    case 'user':
      return (<BaseIcon viewBox='0 0 448 512' {...props}><path d='M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z'></path></BaseIcon>);
    case 'menuStack':
      return (<BaseIcon viewBox='0 0 448 512' {...props}><path d='M436 124H12c-6.627 0-12-5.373-12-12V80c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12zm0 160H12c-6.627 0-12-5.373-12-12v-32c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12zm0 160H12c-6.627 0-12-5.373-12-12v-32c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12z' /></BaseIcon>);
    case 'close':
      return (<BaseIcon viewBox='0 0 320 512' {...props}><path d='M207.6 256l107.72-107.72c6.23-6.23 6.23-16.34 0-22.58l-25.03-25.03c-6.23-6.23-16.34-6.23-22.58 0L160 208.4 52.28 100.68c-6.23-6.23-16.34-6.23-22.58 0L4.68 125.7c-6.23 6.23-6.23 16.34 0 22.58L112.4 256 4.68 363.72c-6.23 6.23-6.23 16.34 0 22.58l25.03 25.03c6.23 6.23 16.34 6.23 22.58 0L160 303.6l107.72 107.72c6.23 6.23 16.34 6.23 22.58 0l25.03-25.03c6.23-6.23 6.23-16.34 0-22.58L207.6 256z'></path></BaseIcon>);
  }
};

export default Icon;