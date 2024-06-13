import React from 'react';
import Column from './Box/Column';

interface MenuProps {
  menuState: { on: boolean; select: string | null };
  setMenuState: React.Dispatch<React.SetStateAction<{ on: boolean; select: string | null }>>;
}

export const Button: React.FC<MenuProps> = ({ menuState, setMenuState}) => {
  
  const toggleMenu = () => {
    setMenuState(prevState => ({ ...prevState, on: !prevState.on }));
  };

  return (
    <>
        <button className="menu-button" onClick={toggleMenu}>Menu</button>
        <Column menuState={menuState} setMenuState={setMenuState}/>
    </>
  );
};

export default Button;