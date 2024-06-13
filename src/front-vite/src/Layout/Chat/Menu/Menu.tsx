import React from 'react';

interface MenuProps {
  items: string[];
  onItemSelect: (item: string) => void;
  onClickOutside: () => void;
}

export const Menu: React.FC<MenuProps> = ({ items, onItemSelect, onClickOutside }) => {
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClickOutside();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClickOutside]);

  // Add invite button at top.
  return (
    <div ref={menuRef} className="chat-menu">
      {items.map((item) => (
        <div key={item} className="chat-menu-item" onClick={() => onItemSelect(item)}>
          {item}
        </div>
      ))}
    </div>
  );
};

export default Menu;
