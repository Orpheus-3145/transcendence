import { ValidateNested, IsBoolean, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { GameDifficulty, GameMode, PowerUpSelection } from 'src/game/game.types';


class PowerUpSelectionDTO {
	@IsBoolean()
	speedball: boolean;

	@IsBoolean()
	powerup_2: boolean;

	@IsBoolean()
	powerup_3: boolean;

	@IsBoolean()
	powerup_4: boolean;

	@IsBoolean()
	powerup_5: boolean;
}

export default class GameInitDTO {
	@IsString()
	sessionToken: string;

	@IsEnum(GameMode)
	mode: GameMode;

	@IsEnum(GameDifficulty)
	difficulty: GameDifficulty;

	@ValidateNested()
	@Type(() => PowerUpSelectionDTO)
	extras: PowerUpSelection;
}
