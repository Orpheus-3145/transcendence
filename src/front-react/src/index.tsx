import React from 'react';
import ReactDOM from 'react-dom/client';
import MainAppComponent from './MainAppComponent';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <MainAppComponent />
  </React.StrictMode>
);
