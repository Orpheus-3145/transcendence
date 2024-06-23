import React, { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
// import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  Divider,
  InputBase,
  Box,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

export const SearchBar: React.FC = () => {
  // const [searchQuery, setSearchQuery] = useState('');
  // const navigate = useNavigate();
  const theme = useTheme();

  // handle the logic in the following order:
  // username
  // chatname
  // pagename
  // const handleSearch = () => {
  //   if (searchQuery.trim()) {
  //     navigate(`/search/${searchQuery}`);
  //   }
  // };

  // const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (event.key === 'Enter') {
  //     handleSearch();
  //   }
  // };

  return (
    <Box display={'flex'} justifyContent={'flex-start'} alignItems="center">
      <IconButton >
        <SearchIcon sx={{ color: theme.palette.secondary.main }} />
      </IconButton>
      <Divider orientation="vertical" sx={{backgroundColor: theme.palette.secondary.main, width: '0.01em', height: '50%'}} />
      <InputBase placeholder="Search..." inputProps={{ 'aria-label': 'search...' }}
       sx={{ color: theme.palette.secondary.main, flexGrow: 1, marginX: '0.3em' }}
       />
    </Box>
  );
};

export default SearchBar;
