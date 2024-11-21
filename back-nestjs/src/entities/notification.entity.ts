import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { IsAscii, Length } from 'class-validator';
import { User } from './user.entity'


export enum NotificationStatus {
	Accepted = 'Accepted',
	Declined = 'Declined',
	Pending = 'Pending',
}

export enum NotificationType {
	Message = 'message',
	FriendReq = 'Friend Request',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  Sender: User;

  @Column({ nullable: false })
  Receiver: User;

  @Column({ nullable: false })
  type: NotificationType;

  @Column({ nullable: false })
  status: NotificationStatus;

  @Column({ nullable: true, length: 100 })
  @IsAscii()
  @Length(0, 100)
  message: string | null;

  @CreateDateColumn()
  createdAt: Date;
}