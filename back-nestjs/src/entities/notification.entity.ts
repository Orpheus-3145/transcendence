import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { IsAscii, Length } from 'class-validator';


export enum NotificationStatus {
	Accepted = 'Accepted',
	Declined = 'Declined',
	Pending = 'Pending',
  None = 'None',
}

export enum NotificationType {
	Message = 'Message',
	friendRequest = 'Friend Request',
  gameInvite = 'Game Invite',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  senderId: number;

  @Column({nullable: false})
  senderName: string;

  @Column({ nullable: false })
  receiverId: number;

  @Column({nullable: false})
  receiverName: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.Pending,
  })
  status: NotificationStatus;

  @Column({ nullable: true, length: 100 })
  @IsAscii()
  @Length(0, 100)
  message: string | null;

  @CreateDateColumn()
  createdAt: Date;
}