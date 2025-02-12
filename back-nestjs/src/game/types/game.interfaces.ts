import { Socket } from 'socket.io';
import { GameDifficulty, GameMode, PowerUpType } from "./game.enum";


export interface PlayerData {
	playerId: number;
	sessionToken: string;
	nameNick: string;
}

export interface GameData {
	sessionToken: string;
	mode: GameMode;
	difficulty: GameDifficulty;
	extras: Array<PowerUpType>;
}

export interface GameState {
	ball: {
		x: number;
		y: number;
	};
	p1: {
		y: number;
	};
	p2: {
		y: number;
	};
	score: {
		p1: number;
		p2: number;
	};
}

export interface WaitingPlayer {
	clientSocket: Socket;
	extras: Array<PowerUpType>;
}

export interface PlayingPlayer {
	clientSocket: Socket;
	intraId: number;
	nameNick: string;
	score: number;
	posX: number;
	posY: number;
}