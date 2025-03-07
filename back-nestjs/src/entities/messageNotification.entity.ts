import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Message } from './message.entity';
import { ChannelMember } from './chat.entity';
import { NotificationStatus } from './friendRequest.entity';


@Entity('MessageNotifications')
export class MessageNotification {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Message, (message) => message.chatMessage, {
		nullable: false,
		eager: true})
	@JoinColumn({name: 'message_id'})
	message: Message;

	@ManyToOne(() => ChannelMember, (member) => member.chatNotification, {
		nullable: false,
		eager: true})
	@JoinColumn({name: 'receiver_id'})
	receiver: ChannelMember;

	@CreateDateColumn({name: 'created_at'})
	createdAt: Date;

	@Column({
		type: 'enum',
		enum: NotificationStatus,
		default: NotificationStatus.Pending,
	})
	status: NotificationStatus;
}