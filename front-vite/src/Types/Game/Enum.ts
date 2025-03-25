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

export enum PowerUpSelected {
	noPowerUp = 0,        	// (00000)
	speedBall = 1 << 0, 		// (00001)
	speedPaddle = 1 << 1, 	// (00010)
	slowPaddle = 1 << 2, 		// (00100)
	shrinkPaddle = 1 << 3, 	// (01000)
	stretchPaddle = 1 << 4  // (10000)
}

export enum AnimationSelected {
	movingLines = 'movingLines',
	particleEmitter = 'particleEmitter',
	particleSystem = 'particleSystem'
}