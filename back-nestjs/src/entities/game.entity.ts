import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	CreateDateColumn,
	JoinColumn
} from 'typeorm';
import User from './user.entity';


@Entity('Games')
export default class Game {
	@PrimaryGeneratedColumn({ name: 'game_id' })
	id: number;

	@ManyToOne(
		() => User,
		(user) => user.player1Game,
		{
			eager: true,
			onDelete: "CASCADE"
		}
	)
	@JoinColumn({ name: 'player1_id' })
	player1: User;

	@ManyToOne(
		() => User,
		(user) => user.player2Game,
		{
			eager: true,
			onDelete: "CASCADE"
		}
	)
	@JoinColumn({ name: 'player2_id' })
	player2: User;

	@Column({
		type: 'int',
		default: 0
	})
	player1Score: number;

	@Column({
		type: 'int',
		default: 0
	})
	player2Score: number;

	@CreateDateColumn({
		name: 'date_match',
		type: 'date'
	})
	date: Date;

	@Column({
		name: 'powerups_used',
		type: 'int',
		default: 0
	})
	powerups: number;
}