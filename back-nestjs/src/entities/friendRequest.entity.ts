import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import User from './user.entity';


export enum NotificationStatus {
	Accepted = 'Accepted',
	Declined = 'Declined',
	Pending = 'Pending',
}

@Entity('FriendRequests')
export class FriendRequest {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(
		() => User,
		(user: User) => user.senderFriendRequests,
		{
			eager: true,
			onDelete: "CASCADE"
		}
	)
	@JoinColumn({ name: 'sender_id' })
	sender: User;

	@ManyToOne(
		() => User,
		(user: User) => user.receiverFriendRequests,
		{
			eager: true,
			onDelete: "CASCADE"
		}
	)
	@JoinColumn({ name: 'receiver_id' })
	receiver: User;

	@CreateDateColumn({ name: 'created_at' })
	created: Date;

	@Column({
		type: 'enum',
		enum: NotificationStatus,
		default: NotificationStatus.Pending,
	})
	status: NotificationStatus;
}