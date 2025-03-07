import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn} from 'typeorm';
import { MessageNotification } from './messageNotification.entity';
import { Channel, ChannelMember } from './chat.entity';


@Entity('Messages')
export class Message {
	@PrimaryGeneratedColumn()
	msg_id: number;

	@ManyToOne(() => Channel, (channel: Channel) => channel.messages, {
		nullable: false,
		eager: true})
	@JoinColumn({ name: 'channel_id' })
	channel: Channel; 

	@ManyToOne(() => ChannelMember, (member: ChannelMember) => member.sender, {
		nullable: false,
		eager: true})
	@JoinColumn({ name: 'sender_id' })
	sender: ChannelMember;

	@Column('text')
	content: string;

	@CreateDateColumn()
	send_time: Date;

	@OneToMany(() => MessageNotification, (chatNotification: MessageNotification) => chatNotification.message)
	chatMessage: MessageNotification[];
}