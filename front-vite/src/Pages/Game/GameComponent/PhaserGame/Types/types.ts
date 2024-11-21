export enum GameMode {
  single = 'single',
  multi = 'multi',
  unset = 'unset',
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
	player1: { 
		y: number 
	}, player2: { 
		y: number
	},
	score: {
		p1: number, 
		p2: number}
};

export interface PlayerData {
  playerId: number;
  nameNick: string;
};

export interface InitData {
  sessionToken: string;
  mode: GameMode;
};