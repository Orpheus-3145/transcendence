import { IsString, IsEnum, IsArray } from 'class-validator';
import { GameDifficulty, GameMode, PowerUpType } from 'src/game/game.types';

export default class GameInitDTO {
	@IsString()
	sessionToken: string;

	@IsEnum(GameMode)
	mode: GameMode;

	@IsEnum(GameDifficulty)
	difficulty: GameDifficulty;

	@IsArray()
	@IsEnum(PowerUpType, { each: true })
	extras: Array<PowerUpType>;
}
