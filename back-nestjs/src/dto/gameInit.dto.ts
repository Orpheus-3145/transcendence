import { IsString, IsEnum, IsArray } from 'class-validator';
import { GameDifficulty, GameMode, PowerUpTypes } from 'src/game/game.types';

export default class GameInitDTO {
	@IsString()
	sessionToken: string;

	@IsEnum(GameMode)
	mode: GameMode;

	@IsEnum(GameDifficulty)
	difficulty: GameDifficulty;

	@IsArray()
	@IsEnum(PowerUpTypes, { each: true })
	extras: Array<PowerUpTypes>;
}
