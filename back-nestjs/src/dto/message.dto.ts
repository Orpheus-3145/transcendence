import { IsInt, IsString, IsTimeZone } from 'class-validator';
import { Message } from 'src/entities/message.entity';

export class MessageDTO {

	constructor( message: Message ) {

		this.id = message.msg_id;
		this.message = message.content;
		this.user = message.sender.user.nameNick;
		this.timestamp = message.created;
		this.sender_id = message.sender.channelMemberId;
		this.receiver_id = message.channel.channel_id;
		this.content = message.content;
	}

	@IsInt()
	id: number;

	@IsString()
	message: string;

	@IsString()
	user: string;

	@IsTimeZone()
	timestamp: Date;

	@IsInt()
	sender_id: number; // ID of the user who sent the message

	@IsInt()
	receiver_id: number; // Channel ID

	@IsString()
	content: string; // Message body
}
