import { Entity, PrimaryGeneratedColumn, PrimaryColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn} from 'typeorm';
import { IsBoolean } from 'class-validator';
import User  from './user.entity';
import { ChatNotification } from './chatNotification.entity';

// Channel entity
@Entity('Channels')
export class Channel {
	@PrimaryGeneratedColumn()
	channel_id: number;

	@Column({
		type: 'enum',
		enum: ['public', 'protected', 'private', 'chat'],
		default: 'public',
	})

	// @Column({ nullable: true })
	// isDirectMessage: string;

	@IsBoolean()
	@Column({ type: 'boolean', default: false })
	isDirectMessage: boolean;

	@Column()
	ch_type: string;

	@Column({ type: 'varchar', nullable: false })
	ch_owner: string;

	@Column({ type: 'varchar', nullable: true })
	password: string | null;

	@Column({ type: 'varchar', length: 50, default: 'Welcome to my Channel!' })
	title: string;

	@Column({ type: 'varchar', length: 50, default: 'default_channel_photo.png' })
	channel_photo: string;

	@CreateDateColumn()
	created: Date;

	@OneToMany(() => ChannelMember, (channelMember: ChannelMember) => channelMember.channel)
	members: ChannelMember[];

	@Column("text", { array: true, default: '{}' })
	banned: string[];

	@Column("text", { array: true, default: '{}' })
	muted: string[];

	@OneToMany(() => Message, (message: Message) => message.channel)
	messages: Message[];

	@OneToMany(() => ChatNotification, (ChatNotification))
}

// Channel_Members entity
@Entity('Channel_Members')
export class ChannelMember {
	@PrimaryColumn()
	user_id: number;

	@PrimaryColumn()
	channel_id: number;

	@Column({ nullable: true })
	name: string;

	@Column({
		type: 'enum',
		enum: ['owner', 'admin', 'member'],
		default: 'member',
	})
	member_role: string;

	@ManyToOne(() => Channel, (channel: Channel) => channel.members)
	@JoinColumn({ name: 'channel_id' })
	channel: Channel;
}

// Messages entity
@Entity('Messages')
export class Message {
	@PrimaryGeneratedColumn()
	msg_id: number;

	@Column()
	sender_id: number;

	// @Column()
	// receiver_id: number;

	@Column('text')
	content: string;

	@ManyToOne(() => Channel, (channel: Channel) => channel.messages)
	@JoinColumn({ name: 'channel_id' })
	channel: Channel; 

	@OneToMany(() => ChatNotification, (chatNotification: ChatNotification) => chatNotification.message)
	chatNotifications: ChatNotification[]

	@CreateDateColumn()
	send_time: Date;
}

