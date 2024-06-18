import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../../Pages/Home/index';
import Game from '../../Pages/Game/index';
import ErrorPage from '../../Pages/Error/index';

export const Main: React.FC = () => {
  return (
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="*" element={<ErrorPage />} />
        {/* Add more routes as needed */}
      </Routes>
    </main>
  );
};

export default Main;
