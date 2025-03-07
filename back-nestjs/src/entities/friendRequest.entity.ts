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

  @ManyToOne(() => User, (user: User) => user.senderFriendRequests, {
    nullable: false,
    eager: true})
  @JoinColumn({name: 'sender_id'})
  sender: User;

  @ManyToOne(() => User, (user: User) => user.receiverFriendRequests, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({name: 'receiver_id'})
  receiver: User;

  @CreateDateColumn({name: 'created_at'})
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.Pending,
  })
  status: NotificationStatus;
}