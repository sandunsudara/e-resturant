import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// project imports
import App from 'App';
import { ConfigProvider } from 'contexts/ConfigContext';

// ==============================|| REACT DOM RENDER ||============================== //

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <StrictMode>
    <ConfigProvider>
      <App />
    </ConfigProvider>
  </StrictMode>
);
