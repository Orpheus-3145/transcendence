import { IsInt, IsString } from 'class-validator';

export default class PlayerDataDTO {
	@IsInt()
	playerId: number;

	@IsString()
	nameNick: string;

	@IsString()
	sessionToken: string;
}
