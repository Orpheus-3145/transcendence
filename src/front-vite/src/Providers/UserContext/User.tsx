import axios from 'axios';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export type User = {
  id: string;
  name?: string;
  intraName?: string;
  email?: string;
};

interface UserContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultUser: User = {
  id: '0',
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(defaultUser);
  const navigate = useNavigate();

  const BACKEND_URL: string = import.meta.env.ORIGIN_URL_BACK || 'http://localhost.codam.nl:4000';
  useEffect(() => {
    const validate = async () => {
      try {
        const response = await axios.get<{ id: string }>(BACKEND_URL + '/auth/validate', { withCredentials: true });
        const newUser = response.data.id;
        console.log(newUser);
        setUser(prevUser => ({ ...prevUser, id: newUser }));
      } catch (error) {
        setUser(defaultUser)
        navigate('/login');
      }
    };
    validate();
  }, [navigate]);

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