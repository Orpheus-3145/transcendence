import React from 'react';
import Typography from '@mui/material';

export enum ChatStatus {
    Bubble = 'bubble',
    Drawer = 'drawer',
    Chatbox = 'chatbox',
    Settings = 'settings',
}

export interface ChatMessage {
  message: React.ReactElement<typeof Typography>;
  user: string;
  userPP: React.ReactElement;
  timestamp: React.ReactElement;
}

export enum UserRoles {
  Administrator = 'Administrator',
  Guest = 'Guest',
  Owner = 'Owner',
}

export interface UserProps {
  name: string;
  role: string;
  email: string;
  password: string;
  icon: React.ReactElement;
}

export interface ChatSettings {
  icon: React.ReactElement;
  type: 'public' | 'private' | 'password';
  password: string | null;
  users: UserProps[];
  owner: string;
}

export interface ChatRoom {
  name: string;
  icon: React.ReactElement;
  messages: ChatMessage[];
  settings: ChatSettings;
}

export interface ChatProps {
  chatRooms: ChatRoom[];
  chatStatus: ChatStatus;
  selected: ChatRoom | null;
  searchPrompt: string | null;
}
