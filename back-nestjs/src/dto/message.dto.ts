import { IsInt, IsString } from 'class-validator';
import { Message } from 'src/entities/message.entity';

export class MessageDTO {

	constructor( message: Message ) {

		this.sender_id = message.sender.channelMemberId;
		this.receiver_id = message.channel.channel_id;
		this.content = message.content;
	}
	@IsInt()
	sender_id: number; // ID of the user who sent the message

	@IsInt()
	receiver_id: number; // Channel ID

	@IsString()
	content: string; // Message body
}
