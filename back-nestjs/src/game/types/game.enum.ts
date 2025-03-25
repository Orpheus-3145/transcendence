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

export enum PlayerIdentity {
	self = 0,
	opponent = 1,
}

export enum PaddleDirection {
	up = 'up',
	down = 'down',
}

export enum AnimationSelected {
	movingLines = 'movingLines',
	particleEmitter = 'particleEmitter',
	particleSystem = 'particleSystem'
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

export function fromMaskToArray(values: number): Array<PowerUpType> {
		
	let powerUps: Array<PowerUpType> = [];

	if ( values & PowerUpSelected.speedBall)
		powerUps.push(PowerUpType.speedBall);

	if ( values & PowerUpSelected.speedPaddle)
		powerUps.push(PowerUpType.speedPaddle);

	if ( values & PowerUpSelected.slowPaddle)
		powerUps.push(PowerUpType.slowPaddle);

	if ( values & PowerUpSelected.shrinkPaddle)
		powerUps.push(PowerUpType.shrinkPaddle);

	if ( values & PowerUpSelected.stretchPaddle)
		powerUps.push(PowerUpType.stretchPaddle);

	return powerUps;
}

export function fromArrayToMask(values: Array<PowerUpType>): number {

	let powerUps: number = PowerUpSelected.noPowerUp;

	if ( values.includes(PowerUpType.speedBall) )
		powerUps |= PowerUpSelected.speedBall;

	if ( values.includes(PowerUpType.speedPaddle) )
		powerUps |= PowerUpSelected.speedPaddle;

	if ( values.includes(PowerUpType.slowPaddle) )
		powerUps |= PowerUpSelected.slowPaddle;

	if ( values.includes(PowerUpType.shrinkPaddle) )
		powerUps |= PowerUpSelected.shrinkPaddle;

	if ( values.includes(PowerUpType.stretchPaddle) )
		powerUps |= PowerUpSelected.stretchPaddle;

	return powerUps;
}