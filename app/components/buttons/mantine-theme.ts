'use client';

import { Button, virtualColor, createTheme, rem } from '@mantine/core';
import localFont from 'next/font/local';

const bcsans = localFont({
  src: [
    {
      path: '../../fonts/bcsans-regular.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../fonts/bcsans-regular.woff',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../fonts/bcsans-bold.woff',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../fonts/bcsans-bold.woff',
      weight: '700',
      style: 'italic',
    },
  ],
});

console.log(virtualColor({ name: 'primary', light: 'blue', dark: 'red' }));

// See https://mantine.dev/styles/styles-api/#styles-api-selectors
// See https://mantine.dev/styles/variants-sizes/#adding-custom-variants
export const theme = createTheme({
  colors: {
    primary: [
      '#2776c4', // like bc-blue but light
      '#2065a8', // like bc-blue but light for outline
      '#FCBA19', // bc-orange
      '#003366', // bc-blue
      '#FFFFFF', // white
      '#3949AB', // indigo-600
      '#E0E0E0', // gray-300
      '#CCCCCE', // clear filters on hover
      '#9E9E9E', // gray-500
      '#000000', // black
      '#FF9800', // orange-500
      '#FAFAFA', // gray-50
      '#3F51B5', // indigo-500
    ],
    secondary: [
      '#868E96',
      '#495057',
      '#868E96',
      '#495057',
      '#868E96',
      '#495057',
      '#868E96',
      '#495057',
      '#868E96',
      '#495057',
    ],
    success: [
      '#3CB371',
      '#3CB371',
      '#3CB371',
      '#3CB371',
      '#3CB371',
      '#3CB371',
      '#3CB371',
      '#3CB371',
      '#3CB371',
      '#3CB371',
    ],
    danger: [
      '#d42222',
      '#d42222',
      '#d42222',
      '#d42222',
      '#d42222',
      '#d42222',
      '#d42222',
      '#d42222',
      '#d42222',
      '#d42222',
    ],
    warning: [
      '#FCBA19',
      '#FCBA19',
      '#FCBA19',
      '#FCBA19',
      '#FCBA19',
      '#FCBA19',
      '#FCBA19',
      '#FCBA19',
      '#FCBA19',
      '#FCBA19',
    ],
    info: [
      '#2bceff',
      '#2bceff',
      '#2bceff',
      '#2bceff',
      '#2bceff',
      '#2bceff',
      '#2bceff',
      '#2bceff',
      '#2bceff',
      '#2bceff',
    ],
  },

  // fontFamily:  bcsans,
  autoContrast: false,

  components: {
    Button: Button.extend({
      vars: (_theme, props) => {
        console.log('props', _theme, props);
        if (props.variant === 'filled-orange') {
          return {
            root: {
              '--button-height': rem(40),
              '--button-bg': '#FCBA19',
              fontFamily: bcsans,
              fontWeight: '400',
              letterSpacing: '0.1em',
              color: '#003366',
            },
          };
        }
        if (props.variant === 'bc-orange') {
          return {
            root: {
              '--button-height': rem(40),
              '--button-bg': '#FCBA19',
              color: '#003366',
              fontFamily: bcsans,
              fontSize: rem(14),
              fontWeight: '400',
              letterSpacing: '0.1em',
              padding: '8px 16px',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'filter 0.3s ease',
              '&:hover': {
                backgroundColor: 'inherit',
                transform: 'scale(1.1)',
                filter: 'brightness(110%)',
                outline: '2px solid transparent',
                outlineOffset: '2px',
                outlineColor: 'indigo',
              },
            },
          };
        }
        if (props.variant === 'filled-blue') {
          return {
            root: {
              '--button-bg': '#003366',
            },
          };
        }

        return { root: {} };
      },
      classNames: {
        // root: 'my-root-class',
        // label: 'my-label-class',
        // inner: 'my-inner-class',
      },
      styles: {
        // root: { backgroundColor: 'red' },
        // label: { color: 'blue' },
        // inner: { fontSize: 20 },
      },
    }),
  },
});
