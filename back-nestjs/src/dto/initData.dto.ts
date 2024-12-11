import { IsString, IsEnum } from 'class-validator';
import { GameMode } from '../game/game.types';

export default class InitDataDTO {
    
    @IsString()
    sessionToken: string;

    @IsEnum(GameMode)
    mode: GameMode;
};
