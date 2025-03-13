import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import User from './user.entity';
import { PowerUpSelected } from 'src/game/types/game.enum';
import { NotificationStatus } from './friendRequest.entity';


@Entity('GameInvitations')
export class GameInvitation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => User,
    (user: User) => user.senderGameInvitations,
		{
			eager: true,
			onDelete: "CASCADE"
		}
  )
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(
    () => User,
    (user: User) => user.receiverGameInvitations,
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

  @Column({
    name: 'powerup',
    // type: 'number',
    // enum: PowerUpSelected,
    default: PowerUpSelected.noPowerUp,
  })
  powerUpsSelected: PowerUpSelected;
}