import React, { useRef } from 'react';
import './Bar.css'; // Import CSS for the search bar

interface SearchBarProps {
  onFocus: () => void;
  onInput: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onFocus, onInput }) => {
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
