'use client';

import { generateColors } from '@mantine/colors-generator';
import { createTheme } from '@mantine/core';

// See https://mantine.dev/styles/styles-api/#styles-api-selectors
// See https://mantine.dev/styles/variants-sizes/#adding-custom-variants
export const theme = createTheme({
  colors: {
    primary: generateColors('#2065a8'),

    secondary: generateColors('#868E96'),

    success: generateColors('#3CB371'),

    danger: generateColors('#d42222'),

    warning: generateColors('#FCBA19'),

    info: generateColors('#2bceff'),
  },
});
