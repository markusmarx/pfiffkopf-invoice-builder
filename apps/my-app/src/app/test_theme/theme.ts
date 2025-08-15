
import { createTheme, rem, colorsTuple, MantineColorsTuple } from "@mantine/core";

// Moderne Farbpalette
const primaryColor: MantineColorsTuple = colorsTuple('#2563eb'); // Modernes Blau
const accentColor: MantineColorsTuple = colorsTuple('#f59e0b'); // Warmes Amber

export const mantineTheme = createTheme({
  primaryColor: 'primary',
  colors: {
    primary: primaryColor,
    accent: accentColor,
  },
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontFamilyMonospace: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
  headings: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeight: '600',
    sizes: {
      h1: { fontSize: rem(34), lineHeight: '1.3' },
      h2: { fontSize: rem(26), lineHeight: '1.35' },
      h3: { fontSize: rem(22), lineHeight: '1.4' },
    },
  },
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  radius: {
    xs: rem(4),
    sm: rem(6),
    md: rem(8),
    lg: rem(12),
    xl: rem(16),
  },
  components: {
    AppShell: {
      styles: {
        header: {
          borderBottom: '1px solid var(--mantine-color-gray-2)',
          backgroundColor: 'var(--mantine-color-white)',
          boxShadow: 'var(--mantine-shadow-sm)',
        },
        navbar: {
          borderRight: '1px solid var(--mantine-color-gray-2)',
          backgroundColor: 'var(--mantine-color-gray-0)',
        },
      },
    },
    Button: {
      styles: {
        root: {
          borderRadius: 'var(--mantine-radius-md)',
          fontWeight: 500,
        },
      },
    },
    Paper: {
      defaultProps: {
        shadow: 'sm',
        radius: 'md',
      },
    },
  },
});
