import { IsString, IsEnum, IsNumber } from 'class-validator';
import { GameDifficulty, GameMode, PowerUpSelected } from 'src/game/types/game.enum';

export default class GameDataDTO {
	@IsString()
	sessionToken: string;

	@IsEnum(GameMode)
	mode: GameMode;

	@IsEnum(GameDifficulty)
	difficulty: GameDifficulty;

	@IsNumber()
	extras: PowerUpSelected;
}
