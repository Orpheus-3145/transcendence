import React from 'react';
import './Box.css'; // Import CSS for the profile button

interface NotifyProps {
    notifyState: { on: boolean; select: string | null };
    setNotifyState: React.Dispatch<React.SetStateAction<{ on: boolean; select: string | null }>>;
}

export const Button: React.FC<NotifyProps> = ({notifyState, setNotifyState}) => {
    return (<></>);
};

export default Button;