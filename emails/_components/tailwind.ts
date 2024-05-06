import { tailwindToCSS } from 'tw-to-css';
import defaultTheme from 'tailwindcss/defaultTheme';

export const tailwindConfig = {
  theme: {
    extend: {
      height: {
        18: '4.35rem',
        17: '4.3rem',
        'screen-60': '80vh',
      },
      colors: {
        bcblue: '#003366',
        bcorange: '#FCBA19',
        darkergrey: '#344054',
        mediumgrey: '#475467',
        tableheadergrey: 'rgba(214, 216, 213, 0.15)',
        tablebordergrey: '#EAECF0',
        disabledborder: 'D0D5DD',
        cloudgrey: '#667085',
        divider: '#0000001F',
        linkblue: '#155EEF',
      },
      borderWidth: {
        1: '1px',
        3: '3px',
      },
      textColor: {
        deselected: 'rgba(102, 112, 133, 0.44)',
      },
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
        roboto: ['Roboto', ...defaultTheme.fontFamily.sans],
        bcsans: ['BCSans', 'sans-serif'],
      },
      maxWidth: {
        test: '40%',
      },
    },
  },
};

export const { twi, twj } = tailwindToCSS({
  config: tailwindConfig,
});
