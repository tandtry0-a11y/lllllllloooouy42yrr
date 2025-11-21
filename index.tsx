import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill process.env for the browser environment to satisfy the Gemini Service requirement
// using the key provided by the user in the prompt.
(window as any).process = {
  env: {
    API_KEY: 'AIzaSyD2f5so4Ye1dFObQQxRN0_idCrBdsA_Yto'
  }
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);