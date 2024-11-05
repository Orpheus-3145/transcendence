import axios from 'axios';
import { error } from 'console';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export enum UserStatus {
  Online = 'online',
  Offline = 'offline',
  InGame = 'ingame',
  Idle = 'idle',
}

export interface User {
  id: number;
  nameNick: string | null;
  nameIntra: string;
  nameFirst: string;
  nameLast: string;
  email: string;
  image: string | null;
  greeting: string;
  status: UserStatus;
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

const BACKEND_URL: string = import.meta.env.ORIGIN_URL_BACK || 'http://localhost.codam.nl:4000';

export async function getUserFromDatabase(username: string): Promise<User>
{
  const request = new Request(BACKEND_URL + '/users/profile/' + username, {
    method: "POST",
    body: JSON.stringify({username}),
  });

  const response = await fetch(request)
    .then((raw) => raw.json())
    .then((json) => json as User);
    return response;
}

export async function setNewNickname(username:string, nickname:string): Promise<void> {
  const request = new Request(BACKEND_URL + '/users/profile/' + username + '/newnick/' + nickname, {
    method: "POST",
    body: JSON.stringify({username, nickname}),
  });

  const response = await fetch(request)
    .then((raw) =>raw.json());
  if (!response)
      console.log("M8 SETTIN NICKNAME SUCKS ASS");
  else
    console.log("M8 SETTING NICKNAME IS BADDASS");

}

export async function getFriend(friend:string): Promise<User | null> {
  const request = new Request(BACKEND_URL + '/users/profile/username/friend/' + friend, {
    method: "POST",
    body: JSON.stringify({friend}),
  });

  const response = await fetch(request)
    .then((raw) => raw.json())
    .then((json) => json as User) 
  
    return response;
}

export async function addFriend(username:string, friend:string): Promise<void> {
  const request = new Request(BACKEND_URL + '/users/profile/' + username + '/friend/add/' + friend, {
    method: "POST",
    body: JSON.stringify({username, friend}),
  });

  const response = await fetch(request)
    .then((raw) => raw.json())
    if (!response)
      console.log("M8 ADDING FRIEND FAILES FUCKIN HARD");
    else
      console.log("M8 ADDING FRIEND IS BADDASS");
}

export async function removeFriend(username:string, friend:string): Promise<void> {
  const request = new Request(BACKEND_URL + '/users/profile/' + username + '/friend/remove/' + friend, {
    method: "POST",
    body: JSON.stringify({username, friend}),
  });

  const response = await fetch(request)
    .then((raw) => raw.json())
    if (!response)
      console.log("M8 removing FRIEND FAILES FUCKIN HARD");
    else
      console.log("M8 REMOVING FRIEND IS BADDASS");
}

export async function blockFriend(username:string, friend:string): Promise<void> {
  const request = new Request(BACKEND_URL + '/users/profile/' + username + '/friend/block/' + friend, {
    method: "POST",
    body: JSON.stringify({username, friend}),
  });

  const response = await fetch(request)
    .then((raw) => raw.json())
    if (!response)
      console.log("M8 BLOCKING FRIEND FAILES FUCKIN HARD");
    else
      console.log("M8 BLOCKING FRIEND IS BADDASS");
}

export async function sendMessage(username:string, friend:string, message:string): Promise<void> {
  const request = new Request(BACKEND_URL + '/users/profile/' + username + '/message/' + friend + '/' + message, {
    method: "POST",
    body: JSON.stringify({username, friend, message}),
  });

  const response = await fetch(request)
    .then((raw) => raw.json())
    if (!response)
      console.log("M8 SENDING MESSAGE FAILES FUCKIN HARD");
    else
    console.log("M8 SENDING MESSAGE IS BADDASS");
}

export async function inviteToGame(username:string, friend:string): Promise<void> {
  const request = new Request(BACKEND_URL + '/users/profile/' + username + '/invitegame/' + friend, {
    method: "POST",
    body: JSON.stringify({username, friend}),
  });

  const response = await fetch(request)
    .then((raw) => raw.json())
    if (!response)
      console.log("M8 INVITING TO GAME FAILES FUCKIN HARD");
    else
    console.log("M8 INVITING TO GAME IS BADDASS");
}

export async function changePFP(username:string, image:string): Promise<void> {
  const request = new Request(BACKEND_URL + '/users/profile/' + username + '/changepfp/' + image, {
    method: "POST",
    body: JSON.stringify({username, image}),
  });

  const response = await fetch(request)
    .then((raw) => raw.json())
    if (!response)
      console.log("M8 CHANGIN PFP FAILES FUCKIN HARD");
    else
    console.log("M8 CHANGIN PFP IS BADDASS");
}