import React from "react";
import { ChatProps, ChatStatus } from '../InterfaceChat'
import { Fab } from "@mui/material";
import { Chat as ChatIcon } from '@mui/icons-material';

interface ChatBubbleProps {
    chatProps: ChatProps;
    setChatProps: React.Dispatch<React.SetStateAction<ChatProps>>;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({chatProps, setChatProps}) => {
    function openDrawer() {
        setChatProps({...chatProps, chatStatus: ChatStatus.Drawer, selected: null})
    }
    return (
        <Fab
            color="secondary"
            aria-label="chatBubble"
            onClick={openDrawer}
            sx={{position: 'fixed', bottom: 16, right: 16}}
        >
            <ChatIcon />
        </Fab>
    )
}

export default ChatBubble;