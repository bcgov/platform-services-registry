import { CSSProperties, default as React, MouseEventHandler } from 'react';
import { default as theme, default as themes } from '../theme';
import { ColorSet } from '../types';

type IconSet
  = 'user'
  | 'menuStack'
  | 'close'
  | 'edit'

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
      style={{ ...style, cursor: !!hover ? 'pointer' : 'default', width: `${width}em`, height: `${height}em` }}
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
    case 'edit':
      return (<BaseIcon viewBox='0 0 117.74 122.88' {...props}><path d='M94.62,2c-1.46-1.36-3.14-2.09-5.02-1.99c-1.88,0-3.56,0.73-4.92,2.2L73.59,13.72l31.07,30.03l11.19-11.72 c1.36-1.36,1.88-3.14,1.88-5.02s-0.73-3.66-2.09-4.92L94.62,2L94.62,2L94.62,2z M41.44,109.58c-4.08,1.36-8.26,2.62-12.35,3.98 c-4.08,1.36-8.16,2.72-12.35,4.08c-9.73,3.14-15.07,4.92-16.22,5.23c-1.15,0.31-0.42-4.18,1.99-13.6l7.74-29.61l0.64-0.66 l30.56,30.56L41.44,109.58L41.44,109.58L41.44,109.58z M22.2,67.25l42.99-44.82l31.07,29.92L52.75,97.8L22.2,67.25L22.2,67.25z'></path></BaseIcon>);
  }
};

export default Icon;