import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import { MantineProvider } from '@mantine/core';
import { pfkTheme } from './app/theme/theme';
import '@mantine/core/styles.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <MantineProvider theme={pfkTheme}>
      <App />
    </MantineProvider>
  </StrictMode>
);
