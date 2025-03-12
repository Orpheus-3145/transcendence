import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn} from 'typeorm';
import { Message } from './message.entity';
import User from './user.entity';
import { MessageNotification } from './messageNotification.entity';


export enum ChannelType {
	public = 'public',
	protected = 'protected',
	private = 'private',
}

export enum ChannelMemberType {
	owner = 'owner',
	admin = 'admin',
	member = 'member',
}

// NB remove eager when not necessary

@Entity('Channels')
export class Channel {

	@PrimaryGeneratedColumn()
	channel_id: number;

	@Column({
		type: 'enum',
		enum: ChannelType,
		default: ChannelType.public,
	})
	channel_type: ChannelType;

	@ManyToOne(
		() => User,
		(user: User) => user.channelMember,
		{
			eager: true,
			onDelete: "CASCADE"
		}
	)
	@JoinColumn({ name: 'channel_owner' })
	channel_owner: User;

	@Column({
		name: 'is_active',
		type: 'boolean',
		default: true
	})
	isActive: boolean;

	@Column({
		name: 'is_direct',
		type: 'boolean',
		default: false
	})
	isDirectMessage: boolean;

	@Column({
		type: 'text',
		nullable: true,
		default: null
	})
	password: string | null;

	@Column({
		type: 'text',
		default: 'Welcome to my Channel!'
	})
	title: string;

	@CreateDateColumn({ name: 'created_at' })
	created: Date;

	@Column({
		type: "text",
		array: true,
		default: '{}'
	})		// NB should move this info into channel member?
	banned: string[];

	@Column({
		type: "text",
		array: true,
		default: '{}'
	})		// NB should move this info into channel member?
	muted: string[];

	@OneToMany(
		() => Message,
		(message: Message) => message.channel
	)
	messages: Message[];

	@OneToMany(
		() => ChannelMember,
		(channelMember: ChannelMember) => channelMember.channel
	)
	members: ChannelMember[];
}

// Channel_Members entity
@Entity('Channel_Members')
export class ChannelMember {

	@PrimaryGeneratedColumn({ name: 'channel_member_id' })
	channelMemberId: number

	@ManyToOne(
		() => Channel,
		(channel: Channel) => channel.members,
		{
			eager: true,
			onDelete: "CASCADE"
		}
	)
	@JoinColumn({ name: 'channel_id' })
	channel: Channel;

	@ManyToOne( // NB change 'member' into 'user'
		() => User,
		(user: User) => user.channelMember,
		{
			eager: true,
			onDelete: "CASCADE"
		}
	)
	@JoinColumn({ name: 'user_id' })
	user: User;

	@Column({
		type: 'enum',
		enum: ChannelMemberType,
		default: ChannelMemberType.member,
	})
	memberRole: ChannelMemberType;
	
	@OneToMany(
		() => Message,
		(message: Message) => message.sender
	)
	sender: Message[];

	@OneToMany(
		() => MessageNotification,
		(chatNotification: MessageNotification) => chatNotification.receiver
	)
	chatNotification: MessageNotification[];
}
