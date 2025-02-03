import { render } from '@react-email/render';
import { JSX } from 'react';

export const getContent = (jsx: JSX.Element) => render(jsx, { pretty: false });
