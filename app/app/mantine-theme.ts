'use client';

import { generateColors } from '@mantine/colors-generator';
import { createTheme } from '@mantine/core';

// See https://mantine.dev/styles/styles-api/#styles-api-selectors
// See https://mantine.dev/styles/variants-sizes/#adding-custom-variants
export const theme = createTheme({
  colors: {
    primary: generateColors('#003366'),
    secondary: generateColors('#868e96'),
    success: generateColors('#3cb371'),
    danger: generateColors('#d42222'),
    warning: generateColors('#fcba19'),
    info: generateColors('#2bceff'),
    dark: [
      '#d5d7e0',
      '#acaebf',
      '#8c8fa3',
      '#666980',
      '#4d4f66',
      '#34354a',
      '#2b2c3d',
      '#1d1e30',
      '#0c0d21',
      '#01010a',
    ],
  },
});
