import { IsString, IsEnum } from 'class-validator';
import { PaddleDirection } from 'src/game/types/game.enum';

export default class PaddleDirectionDTO {
	@IsEnum(PaddleDirection)
	direction: PaddleDirection;

	@IsString()
	sessionToken: string;
}
