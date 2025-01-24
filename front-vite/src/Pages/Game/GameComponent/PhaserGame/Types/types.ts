export enum GameMode {
	single = 'single',
	multi = 'multi',
	unset = 'unset', // This is only the case when the variable is initialised, it is always overwritten with 'single' or 'multi'
}

export enum GameDifficulty {
	easy = 'easy',
	medium = 'medium',
	hard = 'hard',
	unset = 'unset', // This is only the case when the variable is initialised, it is always overwritten with 'single' or 'multi'
}

export enum PaddleDirection {
	up = 'up',
	down = 'down',
}

export enum PowerUpType {
	speedBall = 'speedBall',
	speedPaddle = 'speedPaddle',
	slowPaddle = 'slowPaddle',
	shrinkPaddle = 'shrinkPaddle',
	stretchPaddle = 'stretchPaddle'
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

export interface InitData {
	sessionToken: string;
	mode: GameMode;
	difficulty: GameDifficulty;
	extras: Array<PowerUpType>;
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
