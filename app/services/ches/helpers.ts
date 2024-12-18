import { render } from '@react-email/render';

export const getContent = (jsx: JSX.Element) => render(jsx, { pretty: false });
