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
  user: React.ReactElement<typeof Typography>;
  userPP: React.ReactElement;
  timestamp: React.ReactElement;
}

export interface ChatSettings {
  icon: React.ReactElement;
  type: 'public' | 'private' | 'password';
  password: string | null;
  users: string[];
  owner: string;
}

export interface ChatRoom {
  name: React.ReactElement<typeof Typography>;
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
