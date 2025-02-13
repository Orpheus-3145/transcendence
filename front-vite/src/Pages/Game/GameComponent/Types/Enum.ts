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