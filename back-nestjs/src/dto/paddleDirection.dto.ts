import { IsString, IsEnum } from 'class-validator';
import { GameMode, PaddleDirection } from '../game/game.types';

export default class PaddleDirectionDTO {
    @IsEnum(PaddleDirection)
    direction: PaddleDirection;
    
    @IsString()
    sessionToken: string;
};
