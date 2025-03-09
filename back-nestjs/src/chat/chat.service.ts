import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Channel, ChannelMember, ChannelMemberType, ChannelType } from 'src/entities/chat.entity';
import { ChatDTO } from '../dto/chat.dto'
import { NotificationService } from 'src/notification/notification.service';
import User from 'src/entities/user.entity';
import { Message } from 'src/entities/message.entity';
import ExceptionFactory from 'src/errors/exceptionFactory.service';
import AppLoggerService from 'src/log/log.service';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(Channel)
		private readonly channelRepository: Repository<Channel>,

		@InjectRepository(ChannelMember)
		private readonly channelMemberRepository: Repository<ChannelMember>,

		@InjectRepository(Message)
		private readonly messageRepository: Repository<Message>,

		@InjectRepository(User)
		private readonly userRepository: Repository<User>,

		private readonly notificationService: NotificationService,
		private readonly thrower: ExceptionFactory,
		private readonly logger: AppLoggerService,
		private readonly config: ConfigService,
	) {}

	async getUser(userId: number, throwExcept: boolean = false): Promise<User> {

		const user: User = await this.userRepository.findOne({ where: { id: userId }});
		if (!user && throwExcept === true)
			this.thrower.throwChatExcp(`No user found with id: ${userId}`,
				`${ChatService.name}.${this.constructor.prototype.getUser.name}()`,
				HttpStatus.NOT_FOUND);

		return user;
	}

	async getChannel(channelId: number, throwExcept: boolean = false): Promise<Channel> {

		const channel: Channel = await this.channelRepository.findOne({ where: { channel_id: channelId }});
		if (!channel && throwExcept === true)
			this.thrower.throwChatExcp(`No channel found with id: ${channelId}`,
				`${ChatService.name}.${this.constructor.prototype.getChannel.name}()`,
				HttpStatus.NOT_FOUND);

		return channel;
	}

	async getMember(channelId: number, userId: number, throwExcept: boolean = false): Promise<ChannelMember> {

		const member: ChannelMember = await this.channelMemberRepository.findOne({
			where: {
				channel: { channel_id: channelId },
				member: { id: userId }
			}
		});
		if (!member && throwExcept === true)
			this.thrower.throwChatExcp(`No member found with userId: ${userId} belonging to channel id: ${channelId}`,
				`${ChatService.name}.${this.constructor.prototype.getMember.name}()`,
				HttpStatus.NOT_FOUND);

		return member;
	}

	async createChannel(chatDTO: ChatDTO): Promise<Channel> {

		const channelOwner: User = await this.getUser(parseInt(chatDTO.ch_owner, 10), true);
		const newChannel = this.channelRepository.create({
			channel_type: chatDTO.ch_type,
			channel_owner: channelOwner,
			isActive: chatDTO.isActive,
			isDirectMessage: chatDTO.isDirectMessage,
			password: chatDTO.password,
			title: chatDTO.title,
			created: new Date(),
			banned: chatDTO.banned,
			muted: chatDTO.muted,
		});

		await this.channelRepository.save(newChannel);
		this.logger.log(`Created new channel id: ${newChannel.channel_id}`);

		for (const member of chatDTO.users)
			this.addUserToChannel(newChannel, member.id);

		await this.changeUserRole(channelOwner, newChannel, ChannelMemberType.owner);

		return newChannel;
	}

	async deleteChannel(channelToDelete: number | Channel): Promise<void> {

		if (typeof channelToDelete === 'number')
			channelToDelete = await this.getChannel(channelToDelete, true);

		// because of the 'ON CASCADE' option, every message and every channel member
		// related to chis channel will be removed as well 
		await this.channelRepository.delete({ channel_id: channelToDelete.channel_id });

		this.logger.log(`Deleting channel id: ${channelToDelete.channel_id} (cleaning all related messages and members)`);
	}

	async addUserToChannel(channel: number | Channel, user: number | User): Promise<void> {

		if (typeof channel === 'number')
			channel = await this.getChannel(channel, true);
		
		if (typeof user === 'number')
			user = await this.getUser(user, true);
	
		const newMember: ChannelMember = this.channelMemberRepository.create({
			channel: channel,
			member: user,
		});
		await this.channelMemberRepository.save(newMember);

		this.logger.log(`User ${user.nameNick} added to channel id: ${channel.channel_id}`);
	}

	async removeUserFromChannel(userToRemove: number | User, channel: number | Channel): Promise<void> {

		if (typeof userToRemove === 'number')
			userToRemove = await this.getUser(userToRemove, true);

		if (typeof channel === 'number')
			channel = await this.getChannel(channel, true);
		
		const [memberToRemove, otherMembers] = await Promise.all([
			this.getMember(channel.channel_id, userToRemove.id, true),
			this.channelMemberRepository.find({
				where: { 
					channel: { channel_id: channel.channel_id },
					member: { id: Not(userToRemove.id) }},
				order: { memberRole: 'ASC' },
			})
		])
		// no other members, remove channel
		if (otherMembers.length === 0) {

			this.logger.log(`User ${userToRemove.nameNick} was the last in the channel, removing it`);
			this.deleteChannel(memberToRemove.channel);
			return ;
		}

		// if the user to remove is an owner, the ownership has to be changed
		if (memberToRemove.memberRole === ChannelMemberType.owner) {
			const newOwner: ChannelMember = otherMembers[0];
			this.logger.log(`User ${userToRemove.nameNick} was the owner of the channel, before removing, switching ownership with ${newOwner.member.nameNick}`);
			this.changeUserRole(newOwner.member, newOwner.channel, ChannelMemberType.owner);
		}
		await this.channelMemberRepository.delete({ channelMemberId: memberToRemove.channelMemberId });

		this.logger.log(`User ${userToRemove.nameNick} removed from channel id ${channel.channel_id}`);
	}

	async createMessage(channel: number | Channel, sender: number | User, content: string): Promise<Message> {

		if (typeof channel === 'number')
			channel = await this.getChannel(channel, true);

		if (typeof sender === 'number')
			sender = await this.getUser(sender, true);
		
		const memberSender: ChannelMember = await this.getMember(channel.channel_id, sender.id, true);
		const newMessage: Message = this.messageRepository.create({
			channel: channel,
			sender: memberSender,
			content: content,
		});
		await this.messageRepository.save(newMessage);

		this.logger.log(`New message from ${sender.nameNick} in channel id: ${channel.channel_id}, content: '${content}'`);

		const receivers: ChannelMember[] = await this.channelMemberRepository.find({
			where: {
				channel: { channel_id: channel.channel_id },
				member: { id: Not(memberSender.member.id) }
			}
		});
		if (receivers.length === 0)
			this.thrower.throwChatExcp(`Channel id: ${channel.channel_id} has only one member`,
				`${ChatService.name}.${this.constructor.prototype.createMessage.name}()`,
				HttpStatus.INTERNAL_SERVER_ERROR);

		for (const receiver of receivers)
			await this.notificationService.createMessageNotification(newMessage, receiver);

		return newMessage;
	}

	async getMembersFromChannel(channel: number | Channel): Promise<ChannelMember[]> {
	
		if (typeof channel === 'number')
			channel = await this.getChannel(channel, true);
	
		this.logger.log(`Fetching all members from channel id: ${channel.channel_id}`);
		return (channel.members);
	}

	async getMessagesForChannel(channel: number | Channel): Promise<Message[]> {

		if (typeof channel === 'number')
			channel = await this.getChannel(channel, true);

		this.logger.log(`Fetching all messages from channel id: ${channel.channel_id}`);
		return channel.messages;
	}

	async getAllChannels(): Promise<Channel[]> {

		const channels: Channel[] = await this.channelRepository.find({
			select: [
				'channel_id',
				'channel_type',
				'title',
				'channel_owner',
				'password',
				'isDirectMessage',
				'banned',
				'muted'
			],
			relations: ['members', 'messages'], // Ensure messages are included
		});

		this.logger.log(`Fetching all chats`);
		return channels;
	}

	async banUserFromChannel(userToBan: number | User, channel: number | Channel): Promise<void> {
	
		if (typeof userToBan === 'number')
			userToBan = await this.getUser(userToBan, true);

		if (typeof channel === 'number')
			channel = await this.getChannel(channel, true);

		channel.banned.push(userToBan.id.toString());
		await Promise.all([
			this.channelRepository.save(channel),
			this.removeUserFromChannel(userToBan, channel)
		]);
		this.logger.log(`Banning ${userToBan.nameNick} from channel id: ${channel.channel_id}`);
	}

	async unbanUserFromChannel(userToUnban: number | User, channel: number | Channel): Promise<void> {
	
		if (typeof userToUnban === 'number')
			userToUnban = await this.getUser(userToUnban, true);

		if (typeof channel === 'number')
			channel = await this.getChannel(channel, true);

		channel.banned = channel.banned.filter((item: string) => item !== userToUnban.id.toString());
		await Promise.all([
			this.channelRepository.save(channel),
			this.addUserToChannel(channel, userToUnban),
		]);
		this.logger.log(`Unbanning ${userToUnban.nameNick} from channel id: ${channel.channel_id}`);
	}
	
	async muteUserFromChannel(userToMute: number | User, channel: number | Channel): Promise<void> {
	
		if (typeof userToMute === 'number')
			userToMute = await this.getUser(userToMute, true);

		if (typeof channel === 'number')
			channel = await this.getChannel(channel, true);

		channel.muted.push(userToMute.id.toString());
		await this.channelRepository.save(channel);

		this.logger.log(`Muting ${userToMute.nameNick} from channel id: ${channel.channel_id}`);
	}
	
	async unmuteUserFromChannel(userToUnmute: number | User, channel: number | Channel): Promise<void> {
	
		if (typeof userToUnmute === 'number')
			userToUnmute = await this.getUser(userToUnmute, true);

		if (typeof channel === 'number')
			channel = await this.getChannel(channel, true);

		channel.muted = channel.muted.filter((item: string) => item !== userToUnmute.id.toString());
		await this.channelRepository.save(channel);

		this.logger.log(`Unmuting ${userToUnmute.nameNick} from channel id: ${channel.channel_id}`);
	}

	async changePrivacy(channelToChange: number | Channel, newChannelPolicy: ChannelType, password: string | null): Promise<void> {
		
		if (typeof channelToChange === 'number')
			channelToChange = await this.getChannel(channelToChange, true);

		channelToChange.channel_type = newChannelPolicy;
		if (newChannelPolicy === ChannelType.protected) {
			if (!password)
				this.thrower.throwChatExcp(`Channel password not provided or null`,
					`${ChatService.name}.${this.constructor.prototype.changePrivacy.name}()`,
					HttpStatus.BAD_REQUEST);
			
			channelToChange.password = await this.hashPassword(password);
		}
		await this.channelRepository.save(channelToChange);

		this.logger.log(`Changing privacy of channel id: ${channelToChange.channel_id}, new policy: ${newChannelPolicy}`);
	}

	async changeOwnershipChannel(newOwner: number | User, channel: number | Channel): Promise<void> {

		if (typeof newOwner === 'number')
			newOwner = await this.getUser(newOwner, true);

		if (typeof channel === 'number')
			channel = await this.getChannel(channel, true);
	
		channel.channel_owner = newOwner;
		await this.channelRepository.save(channel);

		this.logger.log(`Changed ownership of channel id: ${channel.channel_id} to user ${newOwner.nameNick}`);
	}
	
	async changeUserRole(userToChange: number | User, channel: number | Channel, newRole: ChannelMemberType): Promise<ChannelMember> {
		
		if (typeof userToChange === 'number')
			userToChange = await this.getUser(userToChange, true);

		if (typeof channel === 'number')
			channel = await this.getChannel(channel, true);
	
		const memberToChange: ChannelMember = await this.getMember(channel.channel_id, userToChange.id, true);

		memberToChange.memberRole = newRole;
		await this.channelMemberRepository.save(memberToChange);
		
		this.logger.log(`Changed role of user ${userToChange.nameNick} into ${newRole} in channel id: ${channel.channel_id}`);

		if (newRole === ChannelMemberType.owner)
			await Promise.all([
				this.changeUserRole(channel.channel_owner, channel, ChannelMemberType.admin),
				this.changeOwnershipChannel(userToChange, channel),
			])

		return (memberToChange);
	}

	async hashPassword(pwd: string): Promise<string> {
		const saltRounds = parseInt(this.config.get<string>('POSTGRES_SALT_HASH'), 10);
		const hashPwd: string = await bcrypt.hash(pwd, saltRounds);
		
		return hashPwd;
	}

	async verifyPassword(inputPassword: string, channel: number | Channel): Promise<boolean> {

		if (typeof channel === 'number')
			channel = await this.getChannel(channel, true);

		const channelPassword: string = channel.password;

		return (await bcrypt.compare(inputPassword, channelPassword));
	}
}


