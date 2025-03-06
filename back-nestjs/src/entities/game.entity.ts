import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import User from './user.entity';

// NB add JoinColumn for definition of foreign keys in player1 and player2
@Entity('Games')
export default class Game {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.player1Game, { 
		nullable: false,
		eager: true })
	player1: User;

	@ManyToOne(() => User, (user) => user.player2Game, { 
		nullable: false,
		eager: true })
	player2: User;

	@Column({ type: 'int', default: 0 })
	player1Score: number;

	@Column({ type: 'int', default: 0 })
	player2Score: number;

	@CreateDateColumn({ type: 'date' })
	date: Date;

	@Column({ type: 'int', default: 0 })
	powerups: number;
}