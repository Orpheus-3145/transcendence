import { IsString, IsEnum, IsArray } from 'class-validator';
import { GameDifficulty, GameMode, PowerUpType } from 'src/game/types/game.enum';

export default class GameDataDTO {
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
