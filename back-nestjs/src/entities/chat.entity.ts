import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Chat {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column()
	type: 'public' | 'private' | 'password';

	@Column({ nullable: true })
	password: string | null;

	@ManyToMany(() => User)
	@JoinTable()
	users: User[];

	@Column('jsonb', { default: [] })
	messages: Array<{
		message: string;
		userId: number
		timestamp: string;
	}>;
}