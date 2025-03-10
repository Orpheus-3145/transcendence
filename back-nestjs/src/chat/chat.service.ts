import { Injectable, Inject, forwardRef} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, Channel, ChannelMember } from 'src/entities/chat.entity';
import {ChatDTO } from '../dto/chat.dto'
import { NotificationService } from 'src/notification/notification.service';
import { UsersService } from 'src/users/users.service';
import User from 'src/entities/user.entity';
import {Notification} from 'src/entities/notification.entity'
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

		@Inject(forwardRef(() => UsersService))
		private readonly userService: UsersService,

		@Inject(forwardRef(() => NotificationService))
		private readonly notificationService: NotificationService,

		private readonly notificationGateway: NotificationGateway,
	) {}

	// // Create or find a channel
	// async findOrCreateChannel(channelData: Partial<Channel>): Promise<Channel> {
	// 	let channel = await this.channelRepository.findOneBy({
	// 		title: channelData.title,
	// 	});
	// 	if (!channel) {
	// 		channel = this.channelRepository.create(channelData);
	// 		await this.channelRepository.save(channel);
	// 	}
	// 	return channel;
	// }

	async createChannel(chatDTO: ChatDTO): Promise<Channel> {
		const { title, ch_type, ch_owner, users, banned, muted, password, isDirectMessage } = chatDTO;

		// console.log('chatDTO:', chatDTO);
		const newChannel = this.channelRepository.create({
		  title,
		  ch_type,
		  ch_owner,
		  password,
		//   channel_photo: chatDTO.channel_photo || 'default_channel_photo.png',
		  created: new Date(),
		  isDirectMessage,
		  banned,
		  muted,
		});
		const savedChannel = await this.channelRepository.save(newChannel);
		// console.log('new channel:', newChannel);
		const userEntities = users.map(user => {
			// console.log('user.nameIntra:', user.nameIntra);
			return {
				user_id: user.id,
				name: user.nameIntra,
		  		channel_id: savedChannel.channel_id,
		  		member_role: user.role,
			}	
		});
		// console.log('userEntities:', userEntities);
		await this.channelMemberRepository.save(userEntities);
		const fullChannel = await this.channelRepository.findOne({
			where: { channel_id: savedChannel.channel_id },
			relations: ['members'],
		});
		// console.log('full channel:', fullChannel);
		return fullChannel;
	}
	  

	// Add user to a channel
	async addUserToChannel(user_id: number, name: string, channel_id: number, role = 'member') {
		const membership = this.channelMemberRepository.create({
			user_id,
			name,
			channel_id,
			member_role: role,
		});
		console.log(membership);
		return this.channelMemberRepository.save(membership);
	}

	// async createMessage(sender_id: number, receiver_id: number, content: string): Promise<Message> {
	// 	const message = this.messageRepository.create({
	// 		sender_id,
	// 		receiver_id,
	// 		content,
	// 	});
	
	// 	const savedMessage = await this.messageRepository.save(message);
	// 	console.log('Saved Message in service', savedMessage);
	
	// 	return savedMessage;
	// }
	  

	// // Remove user to a channel
	// async removeUserFromChannel(user_id: number, channel_id: number, role: string) {
	//   // Find the user's membership in the channel
	//   const membership = await this.channelMemberRepository.findOne({
	// 	where: { user_id, channel_id },
	//   });
	//   console.log('Membership:', membership.member_role);
	
	//   if (!membership) {
	// 	throw new Error('User is not a member of the channel');
	//   }
	
	//   // Check if the user is the owner of the channel
	//   if (membership.member_role === 'owner') {
	// 		// Transfer ownership to another admin or member
	// 		const otherMembers = await this.channelMemberRepository.find({
	// 			where: { channel_id },
	// 			order: { member_role: 'ASC' }, // Admins will appear before members
	// 		});
		
	// 		if (otherMembers.length > 1) {
	// 			// Assign the first non-owner member as the new owner
	// 			const newOwner = otherMembers.find(
	// 				(member: ChannelMember) => member.user_id !== user_id
	// 			);
	// 			console.log(newOwner);
	// 			if (newOwner) {
	// 				newOwner.member_role = 'owner';
	// 				await this.channelMemberRepository.save(newOwner);
	// 			}

	// 			this.changeOwner(channel_id, newOwner.name);

	// 		} else {
	// 			console.log('Channel empty!');
	// 			// If the channel is empty, delete the channel
	// 			await this.channelMemberRepository.delete({ channel_id });
	// 			await this.channelRepository.delete({ channel_id });
	// 			return;
	// 		}
	//   	}
	//   await this.channelMemberRepository.delete({ user_id, channel_id });
	// }


	async removeUserFromChannel(user_id: number, channel_id: number, role: string) {
		// Find the user's membership in the channel
		const membership = await this.channelMemberRepository.findOne({
			where: { user_id, channel_id },
		});
		console.log('Membership:', membership?.member_role);
	
		if (!membership) {
			throw new Error('User is not a member of the channel');
		}
	
		// Check if the user is the owner of the channel
		let newOwner = null;
		if (membership.member_role === 'owner') {
			// Transfer ownership to another admin or member
			const otherMembers = await this.channelMemberRepository.find({
				where: { channel_id },
				order: { member_role: 'ASC' }, // Admins will appear before members
			});
	
			if (otherMembers.length > 1) {
				// Assign the first non-owner member as the new owner
				newOwner = otherMembers.find(
					(member: ChannelMember) => member.user_id !== user_id
				);
				if (newOwner) {
					newOwner.member_role = 'owner';
					await this.channelMemberRepository.save(newOwner);
				}
			} else {
				console.log('Channel empty!');
				// If the channel is empty, delete the channel
				await this.channelMemberRepository.delete({ channel_id });
				await this.channelRepository.delete({ channel_id });
				return;
			}
		}
	
		// Remove the user from the channel
		await this.channelMemberRepository.delete({ user_id, channel_id });
	
		// Return the new owner (or null if there is no new owner)
		return newOwner ? newOwner.name : null;
	}
	

	async getUsersFromChannel(channel_id: number)
	{
		let channel = await this.getChannelById(channel_id);
		return (channel.members);
	}

	async banUserFromChannel(user_id: number, channel_id: number)
	{
		await this.removeUserFromChannel(user_id, channel_id, "");
		let channel: Channel = await this.channelRepository.findOne({where: {channel_id: channel_id}});
		channel.banned.push(user_id.toString());
		await this.channelRepository.save(channel);
	}

	async unbanUserFromChannel(user_id: number, channel_id: number)
	{
		let channel: Channel = await this.channelRepository.findOne({where: {channel_id: channel_id}});
		channel.banned = channel.banned.filter((item: string) => item !== user_id.toString());
		await this.channelRepository.save(channel);
	}
	
	async muteUserFromChannel(user_id: number, channel_id: number)
	{
		let channel: Channel = await this.channelRepository.findOne({where: {channel_id: channel_id}});
		channel.muted.push(user_id.toString());
		await this.channelRepository.save(channel);
	}
	
	async unmuteUserFromChannel(user_id: number, channel_id: number)
	{
		let channel: Channel = await this.channelRepository.findOne({where: {channel_id: channel_id}});
		channel.muted = channel.muted.filter((item: string) => item !== user_id.toString());
		await this.channelRepository.save(channel);
	}

	// Send a message
	// async sendMessage( sender_id: number, receiver_id: number, content: string ,
	// ): Promise<Message> {
	// 	const message = this.messageRepository.create({
	// 		sender_id,
	// 		receiver_id,
	// 		content,
	// 	});

	// 	// const updatedMessages = await this.messageRepository.find({
	// 	// 	where: { receiver_id },
	// 	// 	relations: ['sender'],
	// 	// });

	// 	return this.messageRepository.save(message);
	// }

	async saveMessage(sender_id: number, receiver_id: number, content: string): Promise<Message> {	
		const channel: Channel = await this.channelRepository.findOne({
		  where: { channel_id: receiver_id },
		});

		if (!channel) {
		  throw new Error(`Channel with id ${receiver_id} not found`);
		}
		
		if (!channel.muted.find((item: string) => item === sender_id.toString()))
		{
			var members: ChannelMember[] = await this.channelMemberRepository.find({where: {channel_id: channel.channel_id}});		
			members.map(async (member: ChannelMember) =>
			{
				if (member.user_id != sender_id)
				{
					var user: User = await this.userService.findOneId(member.user_id);
					if (user != null)
					{
						var noti: Notification = await this.notificationService.initGroupMessage(channel, user, content);
						await this.notificationGateway.sendNotiToFrontend(noti);
					}
				}
			});
		}

		const message = this.messageRepository.create({
		  sender_id,
		  content,
		  channel,
		});

		const savedMessage = await this.messageRepository.save(message);
		// console.log('Saved Mdessage->>', savedMessage);  // Log the saved message for debugging
	  
		return savedMessage;
	}
	  
	async getMessagesForChannel(channel_id: number): Promise<Message[]> {
		// Fetch all messages for the channel, including sender details if necessary
		return this.messageRepository.find({
		  	where: { channel: { channel_id } },
		  	relations: ['channel'],
		  	order: { send_time: 'ASC' },
		});
	}
	
	// // Get messages for a channel
	// async getChannelMessages(channel_id: number): Promise<Message[]> {
	// 	return this.messageRepository.find({ where: { receiver_id: channel_id } });
	// }

 	// Fetch channel by ID
 	async getChannelById(channel_id: number): Promise<Channel | null> {
		return this.channelRepository.findOne({
			where: { channel_id: channel_id },
		});
 	}

 	// Fetch channel user
 	async getUserById(user_id: number, channel_id: number): Promise<ChannelMember | null> {
		return this.channelMemberRepository.findOne({
			where: { user_id, channel_id },  
		});
 	}

	async getAllChannels(): Promise<Channel[]> {
		const channels = await this.channelRepository.find({
			select: ['channel_id', 'title', 'ch_type', 'ch_owner', 'password', 'isDirectMessage', 'banned', 'muted'],
			relations: ['members', 'messages'], // Ensure messages are included
		});
	
		// console.log('Channels with messages:', JSON.stringify(channels, null, 2)); // Debugging log
		return channels;
	}
	
	// Delete a channel
	async deleteChannel(channel_id: number): Promise<Channel | null> {
		try {
			const channel = await this.getChannelById(channel_id);
			if (!channel) {
				return null;
			}
			// Delete associated messages if necessary
			await this.messageRepository.delete({ channel: { channel_id } });
			// Delete associated channel members if necessary
			await this.channelMemberRepository.delete({ channel_id });
			// Delete the channel itself
			await this.channelRepository.remove(channel);
			// console.log('Channel service', channel);
			return channel;
		} catch (error) {
			console.error('Error in deleting channel:', error);
			throw new Error('Error deleting channel');
		}
	}

	async changePrivacy(channel_type: string, channel_id: number, password: string) : Promise<Channel | null> {
		try {
			const channel = await this.getChannelById(channel_id);
			if (!channel) {
				return null;
			}
			channel.ch_type = channel_type;
			channel.password = password;
			await this.channelRepository.save(channel);
			return channel;
		} catch (error) {
			console.error(`Error changing channel privacy: ${error}`);
			return null;
		}
	}

	async changeOwner(channel_id: number, new_owner: string) : Promise<void> {
		const channel = await this.getChannelById(channel_id);
		if (!channel) {
			throw new Error(`Channel with ID ${channel_id} not found`);
		}
		channel.ch_owner = new_owner;
		await this.channelRepository.save(channel);
	}


	async changeUserRole(user_id: number, channel_id: number, new_role: string) : Promise<boolean> {
		const user = await this.getUserById(user_id, channel_id);
		if (!user) {
			return false;
		}
		user.member_role = new_role;
		await this.channelMemberRepository.save(user);
		return true;
	}
}


