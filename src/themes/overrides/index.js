// ===============================||  OVERRIDES - MAIN  ||=============================== //

export default function ComponentsOverrides(theme, borderRadius, outlinedFilled) {
  return {
    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        root: {
          borderRadius,
          fontWeight: 600,
          textTransform: 'none'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius,
          boxShadow: theme.customShadows?.z1
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: outlinedFilled ? theme.vars.palette.grey[50] : 'transparent',
          borderRadius
        },
        notchedOutline: {
          borderRadius
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius
        }
      }
    }
  };
}
