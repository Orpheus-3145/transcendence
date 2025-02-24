import { GameDifficulty, GameMode, PowerUpSelected, PowerUpType } from "./Enum";


export interface PlayerData {
	playerId: number;
	sessionToken: string;
	nameNick: string;
}

export interface GameData {
	sessionToken: string;
	mode: GameMode;
	difficulty: GameDifficulty;
	extras: PowerUpSelected;
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

export interface GameSize {
	width: number;
	height: number;
}

export interface PowerUpPosition {
	x: number;
	y: number;
}

export interface PowerUpStatus {
	active: boolean;
	player: number;
	type: PowerUpType;
}