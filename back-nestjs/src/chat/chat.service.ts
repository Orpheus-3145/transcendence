import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Channel, ChannelMember, ChannelMemberType, ChannelType } from 'src/entities/channel.entity';
import { NotificationService } from 'src/notification/notification.service';
import User from 'src/entities/user.entity';
import { Message } from 'src/entities/message.entity';
import ExceptionFactory from 'src/errors/exceptionFactory.service';
import AppLoggerService from 'src/log/log.service';
import { ConfigService } from '@nestjs/config';
import { ChannelDTO } from 'src/dto/channel.dto';
import { NotificationGateway } from 'src/notification/notification.gateway';


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
		private readonly notificationGateway: NotificationGateway,
		private readonly thrower: ExceptionFactory,
		private readonly logger: AppLoggerService,
		private readonly config: ConfigService,
	) {
		this.logger.setContext(ChatService.name);	
	};

	async getUser(userId: number, throwExcept: boolean = true): Promise<User | null> {

		const user: User = await this.userRepository.findOne({ where: { id: userId }});
		if (!user && throwExcept === true)
			this.thrower.throwChatExcp(`No user found with id: ${userId}`,
				`${ChatService.name}.${this.constructor.prototype.getUser.name}()`,
				HttpStatus.NOT_FOUND);

		return user;
	}

	async getChannel(channelId: number, throwExcept: boolean = true): Promise<Channel | null> {

		const channel: Channel = await this.channelRepository.findOne({
			where: { channel_id: channelId },
			relations: ['channel_owner', 'members', 'members.user', 'messages', 'messages.sender', 'messages.sender.user']
		});
		if (!channel && throwExcept === true)
			this.thrower.throwChatExcp(`No channel found with id: ${channelId}`,
				`${ChatService.name}.${this.constructor.prototype.getChannel.name}()`,
				HttpStatus.NOT_FOUND);

		return channel;
	}

	async getMember(channelId: number, userId: number, throwExcept: boolean = true): Promise<ChannelMember | null> {

		const member: ChannelMember = await this.channelMemberRepository.findOne({
			where: {
				channel: { channel_id: channelId },
				user: { id: userId }
			}
		});
		if (!member && throwExcept === true)
			this.thrower.throwChatExcp(`No member found with userId: ${userId} belonging to channel id: ${channelId}`,
				`${ChatService.name}.${this.constructor.prototype.getMember.name}()`,
				HttpStatus.NOT_FOUND);

		return member;
	}

	async createChannel(channelDTO: ChannelDTO): Promise<Channel> {

		const channelOwner: User = await this.getUser(parseInt(channelDTO.ch_owner, 10));
		let	newChannel = this.channelRepository.create({
			channel_type: channelDTO.ch_type,
			channel_owner: channelOwner,
			isActive: channelDTO.isActive,
			isDirectMessage: channelDTO.isDirectMessage,
			password: channelDTO.password,
			title: channelDTO.title,
			created: new Date(),
			banned: channelDTO.banned,
			muted: channelDTO.muted,
		});
		newChannel = await this.channelRepository.save(newChannel);
		this.logger.log(`${channelOwner.nameNick} created channel id: ${newChannel.channel_id}`);

		for (const member of channelDTO.users)
			await this.addUserToChannel(newChannel, member.id);

		// setting owner of the newliy created channel
		await Promise.all([
			this.changeMemberRole(channelOwner, newChannel, ChannelMemberType.owner),
			this.changeOwnershipChannel(channelOwner, newChannel),
		])
		// re-doing the query because the relations are needed
		newChannel = await this.getChannel(newChannel.channel_id);
		return newChannel;
	}

	async deleteChannel(channelToDelete: number | Channel): Promise<void> {

		if (typeof channelToDelete === 'number')
			channelToDelete = await this.getChannel(channelToDelete);

		// because of the 'ON CASCADE' option, every message and every channel member
		// related to chis channel will be removed as well 
		await this.channelRepository.delete({ channel_id: channelToDelete.channel_id });
		
		this.logger.log(`Deleting channel id: ${channelToDelete.channel_id} (cleaning all related messages and members)`);
	}

	async addUserToChannel(channel: number | Channel, user: number | User): Promise<void> {

		if (typeof channel === 'number')
			channel = await this.getChannel(channel);
		
		if (typeof user === 'number')
			user = await this.getUser(user);

		let newMember: ChannelMember = this.channelMemberRepository.create({
			channel: channel,
			user: user,
		});
		newMember = await this.channelMemberRepository.save(newMember);

		this.logger.log(`${user.nameNick} joined channel id: ${channel.channel_id}`);
	}

	async removeUserFromChannel(userToRemove: number | User, channel: number | Channel): Promise<Channel | null> {

		if (typeof userToRemove === 'number')
			userToRemove = await this.getUser(userToRemove);

		if (typeof channel === 'number')
			channel = await this.getChannel(channel);

		// fetching user to remove and al the other users of the channl
		const [memberToRemove, otherMembers] = await Promise.all([
			this.getMember(channel.channel_id, userToRemove.id),
			this.channelMemberRepository.find({
				where: { 
					channel: { channel_id: channel.channel_id },
					user: { id: Not(userToRemove.id) }},
				order: { memberRole: 'ASC' },
			})
		]);

		if (otherMembers.length === 0) {
			// no other members, remove channel
			this.logger.log(`${userToRemove.nameNick} was the last in the channel, removing it`);
			await this.deleteChannel(memberToRemove.channel);
			return null;
		}

		// if the user to remove is the owner, the ownership has to be changed
		if (memberToRemove.memberRole === ChannelMemberType.owner) {
			const newOwner: ChannelMember = otherMembers[0];
			this.logger.log(`${userToRemove.nameNick} was the owner of the channel, before removing, switching ownership to ${newOwner.user.nameNick}`);

			await Promise.all([
					this.changeMemberRole(newOwner.user, newOwner.channel, ChannelMemberType.owner),
					this.changeOwnershipChannel(newOwner.user, channel),
			]);
			// there were changes, fetch the updated channel
			channel = await this.getChannel(channel.channel_id);
		}
		await this.channelMemberRepository.delete({ channelMemberId: memberToRemove.channelMemberId });
		this.logger.log(`${userToRemove.nameNick} left channel id: ${channel.channel_id}`);
		return channel;
	}

	async createMessage(channel: number | Channel, sender: number | User, content: string): Promise<Message> {

		if (typeof channel === 'number')
			channel = await this.getChannel(channel);

		if (typeof sender === 'number')
			sender = await this.getUser(sender);
		
		if (channel.muted.find((user) => user === sender.id.toString()))
			this.thrower.throwChatExcp(`${sender.nameNick} has been muted!`,
				`${ChatService.name}.${this.constructor.prototype.createMessage.name}()`,
				HttpStatus.OK);
	
		// fetching member from user
		const memberSender: ChannelMember = await this.getMember(channel.channel_id, sender.id);
		let newMessage: Message = this.messageRepository.create({
			channel: channel,
			sender: memberSender,
			content: content,
		});
		newMessage = await this.messageRepository.save(newMessage);

		this.logger.log(`New message from ${sender.nameNick} in channel id: ${channel.channel_id}, content: '${content}'`);

		const receivers: ChannelMember[] = await this.channelMemberRepository.find({
			where: {
				channel: { channel_id: channel.channel_id },
				channelMemberId: Not(memberSender.channelMemberId)
			}
		});
		// if (receivers.length === 0)
		// 	this.thrower.throwChatExcp(`Channel id: ${channel.channel_id} has only one member`,
		// 		`${ChatService.name}.${this.constructor.prototype.createMessage.name}()`,
		// 		HttpStatus.INTERNAL_SERVER_ERROR);
				
		// sending notification of the new message to all the channel members
		for (const receiver of receivers)
			this.notificationGateway.sendMessageNoti(await this.notificationService.createMessageNotification(newMessage, receiver), receiver.user.id.toString());

		return newMessage;
	}

	async getMembersFromChannel(channel: number | Channel): Promise<ChannelMember[]> {
	
		if (typeof channel === 'number')
			channel = await this.getChannel(channel);
	
		this.logger.log(`Fetching all members from channel id: ${channel.channel_id}`);
		return (channel.members);
	}

	async getMessagesForChannel(channel: number | Channel): Promise<Message[]> {

		if (typeof channel === 'number')
			channel = await this.getChannel(channel);

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
				relations: ['channel_owner', 'members', 'members.user', 'messages', 'messages.sender', 'messages.sender.user'], // Ensure members and messages are included
			});

		this.logger.log(`Fetching all chats`);
		return channels;
	}

	async banUserFromChannel(userToBan: number | User, channel: number | Channel): Promise<void> {
	
		if (typeof userToBan === 'number')
			userToBan = await this.getUser(userToBan);

		if (typeof channel === 'number')
			channel = await this.getChannel(channel);

		channel.banned.push(userToBan.id.toString());
		await Promise.all([
			this.channelRepository.save(channel),
			this.removeUserFromChannel(userToBan, channel)
		]);
		this.logger.log(`Banning ${userToBan.nameNick} from channel id: ${channel.channel_id}`);
	}

	async unbanUserFromChannel(userToUnban: number | User, channel: number | Channel): Promise<void> {
	
		if (typeof userToUnban === 'number')
			userToUnban = await this.getUser(userToUnban);

		if (typeof channel === 'number')
			channel = await this.getChannel(channel);

		channel.banned = channel.banned.filter((item: string) => item !== userToUnban.id.toString());
		await this.channelRepository.save(channel);
		this.logger.log(`Unbanning ${userToUnban.nameNick} from channel id: ${channel.channel_id}`);
	}

	async muteUserFromChannel(userToMute: number | User, channel: number | Channel): Promise<void> {
		
		if (typeof userToMute === 'number')
			userToMute = await this.getUser(userToMute);
			
		if (typeof channel === 'number')
			channel = await this.getChannel(channel);


		channel.muted.push(userToMute.id.toString());
		await this.channelRepository.save(channel);

		this.logger.log(`Muting ${userToMute.nameNick} from channel id: ${channel.channel_id}`);
	}
	
	async unmuteUserFromChannel(userToUnmute: number | User, channel: number | Channel): Promise<void> {
	
		if (typeof userToUnmute === 'number')
			userToUnmute = await this.getUser(userToUnmute);

		if (typeof channel === 'number')
			channel = await this.getChannel(channel);

		channel.muted = channel.muted.filter((item: string) => item !== userToUnmute.id.toString());
		await this.channelRepository.save(channel);

		this.logger.log(`Unmuting ${userToUnmute.nameNick} from channel id: ${channel.channel_id}`);
	}

	async changePrivacy(channelToChange: number | Channel, newChannelPolicy: ChannelType, password: string | null): Promise<void> {
		
		if (typeof channelToChange === 'number')
			channelToChange = await this.getChannel(channelToChange);

		channelToChange.channel_type = newChannelPolicy;
		if (newChannelPolicy === ChannelType.protected) {
			if (!password)
				this.thrower.throwChatExcp(`Channel password not provided or null`,
					`${ChatService.name}.${this.constructor.prototype.changePrivacy.name}()`,
					HttpStatus.BAD_REQUEST);
			
			// channel password is stored hashed
			channelToChange.password = await this.hashPassword(password);
		}
		await this.channelRepository.save(channelToChange);

		this.logger.log(`Changing privacy of channel id: ${channelToChange.channel_id}, new policy: ${newChannelPolicy}, pass: ${password}`);
	}

	async changeOwnershipChannel(newOwner: number | User, channel: number | Channel): Promise<void> {

		if (typeof newOwner === 'number')
			newOwner = await this.getUser(newOwner);

		if (typeof channel === 'number')
			channel = await this.getChannel(channel);

		channel.channel_owner = newOwner;
		await this.channelRepository.save(channel);

		this.logger.log(`Changed ownership of channel id: ${channel.channel_id} to ${newOwner.nameNick}`);
	}

	async changeMemberRole(userToChange: number | User, channel: number | Channel, newRole: ChannelMemberType): Promise<ChannelMember> {
		
		if (typeof userToChange === 'number')
			userToChange = await this.getUser(userToChange);

		if (typeof channel === 'number')
			channel = await this.getChannel(channel);
	
		const memberToChange: ChannelMember = await this.getMember(channel.channel_id, userToChange.id);

		memberToChange.memberRole = newRole;
		await this.channelMemberRepository.save(memberToChange);

		this.logger.log(`Changed role of user ${userToChange.nameNick} into ${newRole} of channel id: ${channel.channel_id}`);

		return memberToChange;
	}

	async hashPassword(pwd: string): Promise<string> {
		const saltRounds = parseInt(this.config.get<string>('POSTGRES_SALT_HASH'), 10);
		const hashPwd: string = await bcrypt.hash(pwd, saltRounds);
		
		return hashPwd;
	}

	async verifyPassword(inputPassword: string, channel: number | Channel): Promise<boolean> {

		if (typeof channel === 'number')
			channel = await this.getChannel(channel);

		const channelPassword: string = channel.password;

		return (await bcrypt.compare(inputPassword, channelPassword));
	}
}