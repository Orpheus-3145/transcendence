import React from 'react';
import SearchBar from './Navigation/Search/Bar';
import { Button as MenuButton } from './Navigation/Menu/Button';
import { Button as NotificationButton } from './Navigation/Notification/Button';
import { Button as ProfileButton } from './Navigation/Profile/Button';
import { Button as LoginButton } from './Navigation/Login/Button';


interface MenuProps {
  menuState: { on: boolean; select: string | null };
  setMenuState: React.Dispatch<React.SetStateAction<{ on: boolean; select: string | null }>>;
}

interface NotifyProps {
  notifyState: { on: boolean; select: string | null };
  setNotifyState: React.Dispatch<React.SetStateAction<{ on: boolean; select: string | null }>>;
}

type Props = MenuProps & NotifyProps;

export const Bar: React.FC<Props> = ({ menuState, setMenuState, notifyState, setNotifyState }) => {

  const isLoggedIn = null;
  const user = {name: null, photo: null};

  return (
  <div>
    <div className="header">
      {/* Background - Particle efect - Neural Network */}
      <h1>Transendence</h1>
      <p>Resize to see the effect</p>
    </div>

    <div className="topnav">
      <div className="left">
        <MenuButton menuState={menuState} setMenuState={setMenuState} />
        <SearchBar />
      </div>
      <div className="center">
        {/* Icon */}
      </div>
      <div className="right">
        {isLoggedIn && user ? (
          <>
            <NotificationButton notifyState={notifyState} setNotifyState={setNotifyState} />
            <ProfileButton />
          </>
        ) : (
          <LoginButton />
        )}
      </div>
    </div>
  </div>
  );
};

export default Bar;
