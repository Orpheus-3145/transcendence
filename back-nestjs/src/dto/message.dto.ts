import { IsInt, IsString } from 'class-validator';

export class MessageDTO {
	@IsInt()
	sender_id: number; // ID of the user who sent the message

	@IsString()
	content: string; // Message body

	@IsInt()
	receiver_id: number; // Channel ID
}
