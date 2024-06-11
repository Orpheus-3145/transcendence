import React from 'react';
import './Bar.css';
import Column from './Menu/Column';
import SearchBar from './Search/Bar';
import Profile from './Navigation/Profile';

interface BarProps {
  menuState: { on: boolean; select: string | null };
  setMenuState: React.Dispatch<React.SetStateAction<{ on: boolean; select: string | null }>>;
}

export const Bar: React.FC<BarProps> = ({ menuState, setMenuState }) => {
  const toggleMenu = () => {
    setMenuState(prevState => ({ ...prevState, on: !prevState.on }));
  };

  const handleInputChange = () => {
    const searchBar = document.querySelector('.search-bar') as HTMLInputElement;
    if (searchBar) {
      const barCenter = document.querySelector('.bar-center') as HTMLElement;
      const maxRight = barCenter.offsetLeft - 20; // 20px padding from the centered text
      const minWidth = 100; // Minimum width for 10 characters
      const maxWidth = 500; // Ensure it doesn't expand too much
      const textLength = searchBar.value.length;
      const newWidth = Math.max(minWidth, Math.min(minWidth + textLength * 10, maxRight));

      searchBar.style.width = `${Math.min(newWidth, maxWidth)}px`;
    }
  };

  return (
    <header className="bar">
      <div className="bar-left">
        <button className="menu-button" onClick={toggleMenu}>Menu</button>
        <SearchBar onFocus={handleInputChange} onInput={handleInputChange} />
      </div>
      <div className="bar-center">
        {/* Supposed to be the name of the page */}
        <h1>Center Text</h1>
      </div>
      <div className="bar-right">
        <Profile />
      </div>
      <Column menuState={menuState} setMenuState={setMenuState} />
    </header>
  );
};

export default Bar;
