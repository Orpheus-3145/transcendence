import { IsString, IsEnum , IsBoolean} from 'class-validator';
import { GameMode } from '../game/game.types';

export default class InitDataDTO {
    @IsEnum(GameMode)
    mode: GameMode;
    
    @IsString()
    sessionToken: string;

	@IsBoolean()
	extras: boolean
};
