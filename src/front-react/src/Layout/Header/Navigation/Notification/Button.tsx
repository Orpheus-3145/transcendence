import React from 'react';
import Link from 'react-router-dom'
// import { useAuth } from '../../AuthContext';
import './Button.css'; // Import CSS for the profile button
import Box from './Box/Box';

interface NotifyProps {
  notifyState: { on: boolean; select: string | null };
  setNotifyState: React.Dispatch<React.SetStateAction<{ on: boolean; select: string | null }>>;
}

export const Button: React.FC<NotifyProps> = ({notifyState, setNotifyState}) => {
  // const { isLoggedIn, user } = useAuth();
  const isLoggedIn = null;
  const user = {name: null, photo: null}

  const toggleNotify = () => {
    setNotifyState(prevState => ({ ...prevState, on: !prevState.on }));
  };

  return (
    <>
      {isLoggedIn && user && (
        <>
          <button className="menu-button" onClick={toggleNotify}>Notify</button>
          {notifyState.on && (
            <Box>
              {/* Get non-Answered notifications */}
            </Box>
          )}
        </>
      )}
    </>
  );
};

export default Button;
