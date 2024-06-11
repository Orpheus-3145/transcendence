import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home/index';
import ErrorPage from './Error/index';

export const Main: React.FC = () => {
  return (
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<ErrorPage />} />
        {/* Add more routes as needed */}
      </Routes>
    </main>
  );
};

export default Main;
