import { useMemo } from 'react';

// material-ui
import { createTheme, ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// project imports
import { DEFAULT_THEME_MODE } from 'config';
import CustomShadows from './custom-shadows';
import useConfig from 'hooks/useConfig';
import { buildPalette } from './palette';
import Typography from './typography';
import componentsOverrides from './overrides';

// ==============================|| DEFAULT THEME - MAIN ||============================== //

export default function ThemeCustomization({ children }) {
  const {
    state: { borderRadius, fontFamily, outlinedFilled, palette: paletteOverrides, typography: typographyOverrides }
  } = useConfig();

  const palette = useMemo(() => buildPalette(paletteOverrides), [paletteOverrides]);

  const themeTypography = useMemo(() => Typography(fontFamily, typographyOverrides), [fontFamily, typographyOverrides]);

  const themeOptions = useMemo(
    () => ({
      direction: 'ltr',
      mixins: {
        toolbar: {
          minHeight: '48px',
          padding: '16px',
          '@media (min-width: 600px)': {
            minHeight: '48px'
          }
        }
      },
      typography: themeTypography,
      colorSchemes: {
        light: {
          palette: palette.light,
          customShadows: CustomShadows(palette.light)
        }
      },
      cssVariables: {
        cssVarPrefix: '',
        colorSchemeSelector: 'data-color-scheme'
      }
    }),
    [themeTypography, palette]
  );

  const theme = useMemo(() => {
    const createdTheme = createTheme(themeOptions);
    createdTheme.components = componentsOverrides(createdTheme, borderRadius, outlinedFilled);

    return createdTheme;
  }, [borderRadius, outlinedFilled, themeOptions]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider disableTransitionOnChange theme={theme} modeStorageKey="theme-mode" defaultMode={DEFAULT_THEME_MODE}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
