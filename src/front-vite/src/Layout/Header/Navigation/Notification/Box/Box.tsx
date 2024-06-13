import React from 'react';

interface NotifyProps {
    notifyState: { on: boolean; select: string | null };
    setNotifyState: React.Dispatch<React.SetStateAction<{ on: boolean; select: string | null }>>;
}

export const Button: React.FC<NotifyProps> = ({notifyState, setNotifyState}) => {
    return (<></>);
};

export default Button;