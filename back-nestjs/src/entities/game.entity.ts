import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import User from './user.entity';


@Entity()
export default class Game {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.player1Game, { nullable: false })
	player1Id: User;

	@ManyToOne(() => User, (user) => user.player2Game, { nullable: false })
	player2Id: User;

	@Column({ type: 'int', default: 0 })
	player1Score: number;

	@Column({ type: 'int', default: 0 })
	player2Score: number;

	@CreateDateColumn({ type: 'date' })
	date: Date;

	@Column({ type: 'int', default: 0 })
	powerups: number;
}