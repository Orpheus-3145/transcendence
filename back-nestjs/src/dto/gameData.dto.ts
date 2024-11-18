import { IsInt, IsBoolean, Min } from 'class-validator';

export default class GameDataDTO {
    @IsInt()
    @Min(1)
    windowWidth: number;

    @IsInt()
    @Min(1)
    windowHeight: number;
    
    @IsInt()
    @Min(1)
    paddleWidth: number;
    
    @IsInt()
    @Min(1)
    paddleHeight: number;

    @IsBoolean()
    bot: number;
};