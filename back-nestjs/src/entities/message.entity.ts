import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn} from 'typeorm';
import { MessageNotification } from './messageNotification.entity';
import { Channel, ChannelMember } from './chat.entity';


@Entity('Messages')
export class Message {
	@PrimaryGeneratedColumn()
	msg_id: number;

	@ManyToOne(
		() => Channel,
		(channel: Channel) => channel.messages,
		{
			eager: true,
			onDelete: "CASCADE"
		}
	)
	@JoinColumn({ name: 'channel_id' })
	channel: Channel; 

	@ManyToOne(
		() => ChannelMember,
		(member: ChannelMember) => member.sender,
		{
			eager: true,
			onDelete: "CASCADE"
		}
	)
	@JoinColumn({ name: 'sender_id' })
	sender: ChannelMember;

	@Column()
	content: string;

	@CreateDateColumn({ name: 'created_at' })
	created: Date;

	@OneToMany(
		() => MessageNotification,
		(chatNotification: MessageNotification) => chatNotification.message
	)
	chatMessage: MessageNotification[];
}