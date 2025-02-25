import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn()
  game_id: number;

  @ManyToOne(() => User, (user) => user.sentGames, { nullable: false })
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedGames, { nullable: false })
  receiver: User;

  @Column({ type: 'boolean', default: false })
  custom: boolean;

  @Column({ type: 'int', default: 0 })
  score_sender: number;

  @Column({ type: 'int', default: 0 })
  score_receiver: number;

  @CreateDateColumn({ type: 'date' })
  date_match: Date;

  @Column({ type: 'boolean', default: false })
  powerups_used: boolean;
}