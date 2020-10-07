import { css, Global } from '@emotion/core';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import typography from './typography';

ReactDOM.render(
  <React.StrictMode>
    <Global
      styles={css`
          html, body {
              ${typography.toString()}
              margin: 0;
              padding: 0;
              min-height: '100vh';
              max-width: '100vw';
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
          #root {
              height: 100vw;
            }
          code {
              font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
            }
          .misc-class-m-dropdown-select {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 200px;
          }
          `}
    />
    <App />,
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
