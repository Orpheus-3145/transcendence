import React, { useEffect, useRef } from 'react';
import Row from './Row';

interface ColumnProps {
  menuState: { on: boolean; select: string | null };
  setMenuState: React.Dispatch<React.SetStateAction<{ on: boolean; select: string | null }>>;
}

const Column: React.FC<ColumnProps> = ({ menuState, setMenuState }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setMenuState(prevState => ({ ...prevState, on: false, select: null }));
    }
  };

  const handleMenuItemClick = (item: string) => {
    setMenuState({ on: false, select: item });
  };

  useEffect(() => {
    if (menuState.on) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuState.on]);

  return (
    <div ref={menuRef} className={`menu ${menuState.on ? 'open' : ''}`}>
      <Row text="Option 1" path="/option1" onClick={() => handleMenuItemClick('Option 1')} />
      <Row text="Option 2" path="/option2" onClick={() => handleMenuItemClick('Option 2')} />
      <Row text="Option 3" path="/option3" onClick={() => handleMenuItemClick('Option 3')} />
      {/* Add more menu items as needed */}
    </div>
  );
};

export default Column;
