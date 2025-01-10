import { IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class BallDTO {
	@IsInt()
	@Min(1)
	x: number;

	@IsInt()
	@Min(1)
	y: number;
}

class PlayerDTO {
	@IsInt()
	@Min(1)
	y: number;
}

class ScoreDTO {
	@IsInt()
	@Min(1)
	p1: number;

	@IsInt()
	@Min(1)
	p2: number;
}

export default class GameStateDTO {
	@ValidateNested()
	@Type(() => BallDTO)
	ball: BallDTO;

	@ValidateNested()
	@Type(() => PlayerDTO)
	p1: PlayerDTO;

	@ValidateNested()
	@Type(() => PlayerDTO)
	p2: PlayerDTO;

	@ValidateNested()
	@Type(() => ScoreDTO)
	score: ScoreDTO;
}
