import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

/**
 * Client DOM mounting bootstrap entry point.
 *
 * Locates the `#root` container element and mounts the React application tree
 * wrapped in `React.StrictMode`.
 */
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
