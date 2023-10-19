module.exports = {
  content: [
    './**/*.html',
    './js/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          100: '#EBF1F5',
          200: '#D9E3EA',
          300: '#C5D2DC',
          400: '#9BA9B4',
          500: '#707D86',
          600: '#55595F',
          700: '#33363A',
          800: '#25282C',
          900: '#151719',
        },
        purple: {
          100: '#F4F4FF',
          200: '#E2E1FF',
          300: '#CBCCFF',
          400: '#ABABFF',
          500: '#8D8DFF',
          600: '#5D5DFF',
          700: '#4B4ACF',
          800: '#38379C',
          900: '#262668',
        },
        kitgreen: {
          100: '#e5f4f2',
          200: '#b8d6d2',
          300: '#a1cec8',
          400: '#8ac6be',
          500: '#73beb4',
          600: '#5cb6aa',
          700: '#45aea0',
          800: '#2ea696',
          900: '#179e8c',
          950: '#009682',
        },
        kitcyan: {
          100: '#e9f5fc',
          200: '#d3ecf9',
          300: '#bde3f6',
          400: '#a7d9f3',
          500: '#91d0ef',
          600: '#7bc7ec',
          700: '#65bde9',
          800: '#4fb4e6',
          900: '#39aae3',
          950: '#23a1e0',
        }
      },
      spacing: {
        '9/16': '56.25%',
        '3/4': '75%',
        '1/1': '100%',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        'architects-daughter': ['"Architects Daughter"', 'sans-serif'],
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
        '5xl': '3.25rem',
        '6xl': '4rem',
      },
      inset: {
        full: '100%',
      },
      letterSpacing: {
        tighter: '-0.02em',
        tight: '-0.01em',
        normal: '0',
        wide: '0.01em',
        wider: '0.02em',
        widest: '0.4em',
      },
      minWidth: {
        10: '2.5rem',
      },
      scale: {
        98: '.98',
      },
    },
  },
  plugins: [
    // eslint-disable-next-line global-require
    require('@tailwindcss/forms'),
  ],
};
