import React from 'react';
import Typography from '@mui/material';

export enum ChatStatus {
  Bubble = 'bubble',
  Drawer = 'drawer',
  Chatbox = 'chatbox',
  Settings = 'settings',
  ChannelsPage = 'channelsPage',
}

export enum UserRoles {
  admin = 'admin',
  member = 'member',
  owner = 'owner',
}

export enum ChannelType {
	public = 'public',
	protected = 'protected',
	private = 'private',
}

export interface ChatMessage {
  id: number,
  message: React.ReactElement<typeof Typography>;
  user: string;
  userPP: React.ReactElement;
  timestamp: React.ReactElement;
}

export interface UserProps {
  id: number,
  name: string;
  role: string;
  email: string;
  password: string;
  icon: React.ReactElement;
}

export interface ChatSettings {
	icon: React.ReactElement;
	type: ChannelType;
	password: string | null;
	users: UserProps[];
	owner: string;
  banned: string[];
  muted: string[];
}

export interface ChatRoom {
  id: number,
  name: string;
  icon: React.ReactElement;
  messages: ChatMessage[];
  settings: ChatSettings;
  isDirectMessage: boolean;
}

export interface ChatProps {
	chatRooms: ChatRoom[];
	chatStatus: ChatStatus;
	selected: ChatRoom | null;
	searchPrompt: string | null;
}
