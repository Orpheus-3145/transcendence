export enum GameMode {
  single = 'single',
  multi = 'multi',
  unset = 'unset', // This is only the case when the variable is initialised, it is always overwritten with 'single' or 'multi'
};

export enum PaddleDirection {
  up = 'up',
  down = 'down',
};

export interface GameState { 
	ball: { 
		x: number, 
		y: number
	}, 
	p1: { 
		y: number 
	},
	p2: { 
		y: number
	},
	score: {
		p1: number, 
		p2: number}
};

export interface PowerUp {
	x: number,
	y: number
}

export interface PowerUpStatus {
	active: boolean,
	player: number
}

export interface PlayerData {
	playerId: number;
	sessionToken: string;
	nameNick: string;
};

export interface InitData {
	sessionToken: string;
	mode: GameMode;
	extras: boolean;
};