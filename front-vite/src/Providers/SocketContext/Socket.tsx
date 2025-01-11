import { io, Socket } from 'socket.io-client';
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface SocketInterface {
	socket_obj: Socket | undefined,
	url: string,
}

interface SocketContextType {
  socket: SocketInterface;
  setSocket: React.Dispatch<React.SetStateAction<SocketInterface>>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [socket, setSocket] = useState<SocketInterface>({socket_obj: undefined, url: import.meta.env.URL_WEBSOCKET + import.meta.env.WS_NS_CHAT});
	useEffect(() => {
		setSocket({socket_obj: io(
			socket.url,
			{
				withCredentials: true,
				transports: ['websocket'],
			}
		), url: socket.url})
	}, [socket])
	return (
		<SocketContext.Provider value={{ socket, setSocket }}>
		  {children}
		</SocketContext.Provider>
	)
}