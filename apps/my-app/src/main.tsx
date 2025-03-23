import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import { MantineProvider } from '@mantine/core';
import { mantineTheme } from './app/test_theme/theme';
import { mantineCssVariableResolver } from './app/test_theme/cssVariableResolver';
import '@mantine/core/styles.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <MantineProvider theme={mantineTheme} cssVariablesResolver={mantineCssVariableResolver}>
      <App />
    </MantineProvider>
  </StrictMode>
);
