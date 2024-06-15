import React, { useState } from 'react';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

const Search = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  borderRadius: theme.shape.borderRadius,
  boxShadow: `0em 0.3em 0.3em rgba(0, 0, 0, 0.1)`,
  transition: theme.transitions.create(['background-color', 'border-radius', 'box-shadow'], {
    duration: theme.transitions.duration.standard,
    easing: theme.transitions.easing.easeInOut,
  }),
  '&:hover': {
    borderRadius: '2em',
    boxShadow: `0em 0.3em 0.3em rgba(0, 0, 0, 0.2)`,
    backgroundColor: alpha(theme.palette.primary.light, 0.5),
  },
  [theme.breakpoints.up('sm')]: {
    marginLeft: '1em',
    width: '100%',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(1, 1),
  display: 'flex',
  borderRight: `0.05em solid ${theme.palette.primary.main}`,
  cursor: 'pointer',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.common.white,
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 1),
    transition: theme.transitions.create('width', {
      duration: theme.transitions.duration.shortest,
    }),
  },
}));

export const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // handle the logic in the following order:
  // username
  // chatname
  // pagename
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search/${searchQuery}`);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Search>
      <SearchIconWrapper onClick={handleSearch}>
        <SearchIcon />
      </SearchIconWrapper>
      <StyledInputBase
        placeholder="Search…"
        inputProps={{ 'aria-label': 'search' }}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown} // Updated event
      />
    </Search>
  );
};

export default SearchBar;
