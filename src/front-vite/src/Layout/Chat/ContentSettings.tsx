import React from 'react';
import { ChatProps, ChatStatus, ChatRoom } from './InterfaceChat';
import { Typography } from '@mui/material';

interface ContentSettingsProps {
  chatProps: ChatProps;
  setChatProps: React.Dispatch<React.SetStateAction<ChatProps>>;
}

const ContentSettings: React.FC<ContentSettingsProps> = ({ chatProps, setChatProps }) => {
  const toggleChatStatus = (status: ChatStatus, selection: ChatRoom | null) => {
    setChatProps({ ...chatProps, chatStatus: status, selected: selection });
  };
  return (
    <>
      <Typography>
        EMPTY
      </Typography>
    </>
  );
};

export default ContentSettings;