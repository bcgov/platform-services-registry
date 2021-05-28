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

export default {
  breakpoints: ['40em', '52em', '64em'],
  colors: {
    bcblue: '#036',
    bcorange: '#fcba19',
    bclightblue: '#355991',
    primary: '#036',
    contrast: '#fff',
    grey: '#A9A9A9',
    black: '#000000',
  },
  spacingIncrements: ['30px', '60px', '120px'],
  zIndices: [0, 1, 10, 100, 1000],
  icons: {
    defaultWidth: 1,
    defaultHeight: 1,
  },
  navBar: {
    desktopFixedHeight: '65px',
  },
  heading: {
    margin: '14px 0 5px 0',
    fontSize: '24px',
    fontWeight: 500,
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: 'normal',
    letterSpacing: 'normal',
    color: '#036',
    fontFamily: ['BCSans', 'Noto Sans', 'Verdana', 'Arial', 'sans-serif'],
  },
  forms: {
    label: {
      margin: '14px 0 5px 0',
      fontSize: '20px',
      fontWeight: 500,
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: 'normal',
      letterSpacing: 'normal',
      color: '#036',
    },
    adjacentLabel: {
      flex: '0 0 50%',
      margin: '14px 0 5px 0',
      fontSize: '20px',
      fontWeight: 500,
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: 'normal',
      letterSpacing: 'normal',
      color: '#036',
    },
    errorLabel: {
      flex: '0 0 66%',
      margin: '4px 0 4px 0',
      fontSize: '14px',
      fontWeight: 500,
      color: 'red',
    },
    input: {
      borderRadius: '5px',
      border: 'solid 1px #036',
      backgroundColor: '#fafafa',
      color: '#036',
      textTransform: 'capitalize',
    },
    textarea: {
      borderRadius: '5px',
      border: 'solid 1px #036',
      backgroundColor: '#fafafa',
      color: '#036',
      resize: 'none',
    },
    select: {
      fontSize: '20px',
      fontWeight: 500,
      borderRadius: '5px',
      border: 'solid 1px #036',
      color: '#036',
      backgroundColor: '#fafafa',
    },
    checkbox: {
      margin: 'auto',
    },
  },
};
