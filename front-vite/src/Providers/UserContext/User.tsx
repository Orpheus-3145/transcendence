import axios from 'axios';
import { error } from 'console';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export enum UserStatus {
  Online = 'online',
  Offline = 'offline',
  InGame = 'ingame',
}

export interface User {
  id: number;
  nameNick?: string | null;
  nameFirst?: string;
  nameLast?: string;
  email?: string;
  image?: string | null;
  greeting?: string;
  status?: UserStatus;
}

interface UserContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({ id: 0 });
  const navigate = useNavigate();

  const BACKEND_URL: string = import.meta.env.ORIGIN_URL_BACK || 'http://localhost.codam.nl:4000';
  useEffect(() => {
    const validate = async () => {
      try {
        const response = await axios.get(BACKEND_URL + '/auth/validate', { withCredentials: true });
        const userDTO = response.data.user;
        setUser(userDTO);
      } catch (error) {
        navigate('/login');
        setUser({ id: 0 });
      }
    };
    validate();
  }, [user.id]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};