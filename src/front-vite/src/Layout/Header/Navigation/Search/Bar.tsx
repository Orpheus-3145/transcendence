import React, { useRef } from 'react';

const SearchBar: React.FC = () => {
  const searchBarRef = useRef<HTMLInputElement>(null);

  return (
    <input
      type="text"
      className="search-bar"
      placeholder="Search..."
      ref={searchBarRef}
      // onFocus={onFocus}
      // onInput={onInput}
    />
  );
};

export default SearchBar;
