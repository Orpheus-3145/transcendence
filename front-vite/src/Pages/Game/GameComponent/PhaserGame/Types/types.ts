export enum GameMode {
	single = 'single',
	multi = 'multi',
	unset = 'unset', // This is only the case when the variable is initialised, it is always overwritten with 'single' or 'multi'
}

export enum PaddleDirection {
	up = 'up',
	down = 'down',
}

export enum PowerUpType {
	speedBall = 0,
	speedPaddle = 1,
	slowPaddle = 2,
	shrinkPaddle = 3,
	stretchPaddle = 4
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

export interface PowerUpPosition {
	x: number;
	y: number;
}

export interface PowerUpStatus {
	active: boolean;
	player: number;
	type: PowerUpType;
}

export interface PlayerData {
	playerId: number;
	sessionToken: string;
	nameNick: string;
}

export interface InitData {
	sessionToken: string;
	mode: GameMode;
	extras: boolean;
}
