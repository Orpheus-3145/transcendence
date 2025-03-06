import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsAscii, Length } from 'class-validator';
import { PowerUpSelected } from 'src/game/types/game.enum';
import User from './user.entity';
import { Channel } from './chat.entity';


export enum NotificationStatus {
  Accepted = 'Accepted',
  Declined = 'Declined',
  Pending = 'Pending',
}

// export enum NotificationType {
//   Message = 'Message',
//   friendRequest = 'Friend Request',
//   gameInvite = 'Game Invite',
//   groupChat = 'Group Chat',
// }

@Entity('ChatNotifications')
export class ChatNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Channel, (channel) => channel.chatNotifications, {
    nullable: false,
    eager: true})
  @JoinColumn({name: 'sender_id'})
  sender: User;

  @ManyToOne(() => User, (user) => user.receiverNotification, {
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

  // @Column({
  //   name: 'content',
  //   nullable: true,
  //   length: 100 })
  // @IsAscii()
  // @Length(0, 100)
  // message: string | null;

  // @Column({
  //   name: 'powerup',
  //   type: 'enum',
  //   enum: PowerUpSelected,
  //   default: PowerUpSelected.noPowerUp,
  //   nullable: true,
  // })
  // powerUpsSelected: PowerUpSelected;
}