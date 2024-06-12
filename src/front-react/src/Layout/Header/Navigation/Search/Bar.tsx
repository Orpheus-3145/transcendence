import React, { useRef } from 'react';
import './Bar.css'; // Import CSS for the search bar

const SearchBar: React.FC = () => {
  const searchBarRef = useRef<HTMLInputElement>(null);

  return (
    <input
      type="text"
      className="search-bar"
      placeholder="Search..."
      ref={searchBarRef}
      onFocus={onFocus}
      onInput={onInput}
    />
  );
};

export default SearchBar;
